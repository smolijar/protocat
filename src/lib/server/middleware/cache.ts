import { Middleware, ProtoCatCall } from '../call'
import { CallType } from '../../call-types'
import { Message } from 'google-protobuf'

export interface CacheImplementation<E = unknown> {
  /**
   * Create a unique cache key that will be used for response save and lookup.
   *
   * Return falsy key if caching should be skipped
   */
  hash: (
    call: ProtoCatCall<E, Message, Message, CallType.Unary>
  ) => Promise<string | undefined> | string | undefined
  /** Return buffer from cache. Returning falsy value is considered a cache miss. */
  get: (
    key: string,
    call: ProtoCatCall<E, Message, Message, CallType.Unary>
  ) => Promise<Buffer | undefined> | Buffer | undefined
  /** Set cache result. Result is not awaited and does not block the response nor subsequent requests */
  set: (
    key: string,
    value: Buffer,
    call: ProtoCatCall<E, Message, Message, CallType.Unary>
  ) => void
}

export const createCache = <E = unknown>(
  /** Response binary cache implementation */
  cache: CacheImplementation<E>,
  /** Optional callback to react on cache miss/hit. Called once per request ASAP after cache retrieval */
  cb?: (
    call: ProtoCatCall<E, Message, Message, CallType.Unary>,
    hit: boolean,
    hash: string
  ) => any
): Middleware<E> => async (call, next) => {
  if (call.type !== CallType.Unary) return next()
  const key = await cache.hash(call)
  if (!key) return next()
  let cached = await cache.get(key, call)
  if (!cached) {
    // cache miss
    await cb?.(call, false, key)
    await next()
    cached = call.responseSerialize(call.response)
    cache.set(key, cached, call)
  } else {
    // cache hit
    await cb?.(call, true, key)
  }
  call.bufferedResponse = cached
}
