import { Middleware, ProtoCatAnyCall } from '../call'
import { CallType } from '../../call-types'

type ErrorHandler = (error: Error, call: ProtoCatAnyCall) => any

/**
 * Patches emit function to intercept errors with a handler to be able to consume or map dispatched errors on stream, before existing listeners are invoked.
 * Error events are passed on the handler and metadata are passed on re-thrown errors.
 * @param emitter gRPC call
 * @param handler Error handler that can either throw an error, that will be passed on or not throw, in which case cascade is stopped and call does not end with error
 */
const mapError = (emitter: any, handler: ErrorHandler) => {
  const originalEmit = emitter.emit
  const addMeta = (e: any) => {
    // Trailing metadata on error calls are taken from `error.metadata`, we pass on the existing trailing metadata
    // TODO: At this point existing metadata on error is lost
    e.metadata = emitter.trailingMetadata
    return e
  }
  emitter.emit = async (...args: any[]) => {
    if (args[0] !== 'error') {
      return originalEmit.apply(emitter, args)
    }
    try {
      await handler(args[1], emitter)
    } catch (e) {
      originalEmit.apply(emitter, ['error', addMeta(e)])
    }
  }
}

/**
 * onError creates a Protocat middleware that can be used to intercept errors from various origins, either from:
 *  - sync throws (or async rejects) from following middlewares (or handlers) in the call stack (chain of next functions)
 *  - error emits on streamed calls
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
