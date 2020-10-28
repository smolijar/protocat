import { Middleware, ProtoCatAnyCall } from '../call'
import { CallType } from '../../call-types'
import { Status } from '../../../../dist/proto/status_pb'
import { BadRequest, DebugInfo, Help, LocalizedMessage, PreconditionFailure, QuotaFailure, RequestInfo, ResourceInfo, RetryInfo } from '../../../../dist/proto/error_details_pb'
import { Any } from 'google-protobuf/google/protobuf/any_pb'
import { Message } from 'google-protobuf'
import { Metadata } from '@grpc/grpc-js'

type ErrorHandler = (error: Error, call: ProtoCatAnyCall) => any

const merged = Symbol('protocat.merged')

const detailsMap = {
  'google.rpc.RetryInfo': RetryInfo,
  'google.rpc.DebugInfo': DebugInfo,
  'google.rpc.QuotaFailure': QuotaFailure,
  'google.rpc.PreconditionFailure': PreconditionFailure,
  'google.rpc.BadRequest': BadRequest,
  'google.rpc.RequestInfo': RequestInfo,
  'google.rpc.ResourceInfo': ResourceInfo,
  'google.rpc.Help': Help,
  'google.rpc.LocalizedMessage': LocalizedMessage,
}

const getName = (m: any) => {
  for (const name in detailsMap) {
    if (m instanceof (detailsMap as Record<string, typeof Message>)[name]) return name
  }
}

export const getErrorDetails = (meta: Metadata): Array<typeof detailsMap extends Record<any, new (...args: any) => infer X> ? X : never> => {
  const x = meta.get('grpc-status-details-bin')[0]
  if (x && x instanceof Buffer) {
    const st = Status.deserializeBinary(x)
    // @ts-ignore
    return st.getDetailsList().map(m => detailsMap[m.getTypeName()]?.deserializeBinary(m.getValue_asU8())).filter(x => x)
  }
  return []
}

export const addMeta = (e: any, call: ProtoCatAnyCall) => {
  if (e[merged]) return e
  // Trailing metadata on error calls are taken from `error.metadata`, we pass on the existing trailing metadata
  if (e?.metadata?.merge) {
    e.metadata.merge(call.trailingMetadata)
  } else {
    e.metadata = call.trailingMetadata
  }
  e[merged] = true

  if (Array.isArray(e.details)) {
    // @ts-ignore
    const detailList = (e.details as Message[])
      .filter(d => 'serializeBinary' in d)
      .map(m => {
        const a = new Any()
        a.pack(m.serializeBinary(), getName(m) ?? '')
        return a
      })
    if (detailList.length) {
      const st = new Status()
      st.setDetailsList(detailList)
      e.metadata.set(
        'grpc-status-details-bin',
        Buffer.from(st.serializeBinary())
      )
    }
  }
  return e
}

/**
 * Patches emit function to intercept errors with a handler to be able to consume or map dispatched errors on stream, before existing listeners are invoked.
 * Error events are passed on the handler and metadata are passed on re-thrown errors.
 * @param emitter gRPC call
 * @param handler Error handler that can either throw an error, that will be passed on or not throw, in which case cascade is stopped and call does not end with error
 * @internal
 */
const mapError = (emitter: any, handler: ErrorHandler) => {
  const originalEmit = emitter.emit
  emitter.emit = async (...args: any[]) => {
    if (args[0] !== 'error') {
      return originalEmit.apply(emitter, args)
    }
    try {
      await handler(args[1], emitter)
    } catch (e) {
      emitter.flushInitialMetadata()
      addMeta(e, emitter)
      originalEmit.apply(emitter, ['error', e])
    }
  }
}

/**
 * onError creates a ProtoCat middleware that can be used to intercept errors from various origins, either from:
 *  - sync throws (or async rejects) from the following middlewares (or handlers) in the call stack (chain of next functions)
 *  - error emits on streamed calls
 *
 * No error is ever send to client
 * ```typescript
 * app.use(onError(() => {}))
 * ```
 *
 * Errors are logged and rethrown without stack trace
 * ```typescript
 * app.use(onError((e, call) => {
 *   console.log(e, call)
 *   e.stack = undefined
 *   throw e
 * }))
 * ```
 *
 * @param handler Custom error handler for re-throwing errors and error emits. Result is awaited.
 */
export const onError = (handler: ErrorHandler): Middleware => async (
  call,
  next
) => {
  if (
    call.type === CallType.ServerStream ||
    call.type === CallType.Bidi ||
    call.type === CallType.ClientStream
  ) {
    mapError(call, handler)
  }
  try {
    await next()
  } catch (e) {
    await handler(e, call)
  }
}
