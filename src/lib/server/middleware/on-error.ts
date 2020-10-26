import { Middleware, ProtoCatAnyCall } from '../call'
import { CallType } from '../../call-types'
import { Metadata } from '@grpc/grpc-js'

type ErrorHandler = (error: Error, call: ProtoCatAnyCall) => any

const merged = Symbol('protocat.merged')

export const addMeta = (e: any, call: ProtoCatAnyCall) => {
  if (e[merged]) return e
  // Trailing metadata on error calls are taken from `error.metadata`, we pass on the existing trailing metadata
  if (e?.metadata?.merge) {
    e.metadata.merge(call.trailingMetadata)
  } else {
    e.metadata = call.trailingMetadata
  }
  e[merged] = true
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
