---
title: Caching
---

Either by lack of existing solutions for gRPC caching or by need for a non-trivial logic you might require to use an application cache for your responses.

## Basic middleware cache

Without any extra support, with a bit of effort you can implement middleware level caching just with existing middleware interface and its `next` function, allowing you to skip the following handlers.

```typescript
app.use(async (call, next) => {
  const key = getCacheKey(call)
  const cachedResponse = await cacheGet(key)
  if (cachedResponse) {
    call.response = cachedToProto(cachedResponse)
    // skip following handlers, we have response from cache
    return
  }
  // cache miss, execute handlers
  await next()
  // save result for subsequent requests
  setCacheKey(protoToCached(call.response), TTL)
})
```

This simple middleware is a good start: we effectively skip the handlers, can manage TTL and can combine with any custom logic for the matching. For example we can hook the cache middleware after authentication middleware and create per-user cache with prepared data about user from the call.

Assume we have other than in-memory cache and we need to serialize the instances into some form and back. That is why there are `cachedToProto` and `protoToCached` functions. This is the troublesome part: doing this serialization generically might be challenging (and could be potentially solvable only via custom solution for each RPC/message) and it might not be "cheap" (cache hits should be blistering fast and not perform double encoding `cache-to-proto` by you and `proto-to-wire` by gRPC).

That's why ProtoCat has a mechanism to remove both of the problems: generic approach for all RPCs without mapping functions and avoid double encoding.

## Cache middleware

If you don't care too much about the details, you can just use

```typescript
import { createCache, CacheImplementation } from 'protocat'

const cache: CacheImplementation = {
  set: (key, value, call) => {
    await someStorage.set(key, value) // MUST SET BUFFER
  },
  get: (key, call) => someStorage.get(key), // MUST RETURN BUFFER
  hash: call =>
    `${call.path}::${call.user?.id ?? ''}::${call.request.toArray().join('-')}`,
}
app.use(
  createCache(cache, (call, hit, hash) => {
    call.initialMetadata.set('cache', hit ? 'hit' : 'miss')
    call.initialMetadata.set('cache-key', hash)
  })
)
```

### Cache storage

It does not matter what implementation you have, any sync/async key-value storage that can handle buffers is fine.

:::danger
It is crucial that you return the binary data in buffer as you received them. Be mindful of any encoding changes or data truncate that might happen in your cache. If you fail to return a buffer with the same contents as provided by the set function, you will likely send invalid data on the wire. This will likely result in your client receiving "valid" responses but will crash on the data decoding.
:::

### Different caching settings

In case you don't want to cache some RPC, your `hash` must return falsy value. In that case the middleware will not try to retrieve value from cache nor will save the result. Implement any logic your heart desires in `hash` function. You can read the RPC info, client metadata, data from previous middlewares etc.

### TTL and cache purging

It is all up to you. If you want different TTL for different calls, set the TTL (or delete the record in your cache) yourself. If your `cache.get` returns falsy value, we consider it to be a cache miss for whatever reason (cold start, ttl, etc.). Same goes for cache purging. ProtoCat never needs to clear your cache, so there is no API in the interface for that and you manage it on your own.

## Under the hood

ProtoCat uses the "lowest" available public API of `grpc-js` to hook handlers, that is `server.register`. This allows it to override serialization methods. This way the standard protobuf message to wire function can be overriden to do _noop_ if ProtoCat tells it buffer caching has been used and it skips the default transformation of message to binary.

This is also the reasoning behind how we implemented the generic method. Now that the wire format can be used directly, it is also used as a serialization format that goes to cache storage. That is why it is so crucial to respect the buffer contract and not to tamper with the data in any way. Under normal cricumstances, sending an unserielizable input down gRPC would cause an error on the server, during the encoding. With caching middleware these runtime checks are skipped.

The middleware creator should satisfy your needs, but if you would like to use this mechanism without the middleware helper, it uses public API of the ProtoCat's call context. See the [implementation](https://github.com/grissius/protocat/pull/21) for details.

## Caching other gRPC call types

Cache middleware is skipped for all call types but `unary`. The underlying mechanism works for client streaming as well, but is far less powerful, since hashing function does not receive any client messages and must decide without or read them manually from stream.

At this point I am convinced that it does not make sense to cache streaming calls, since they should be used either for live data or as an event communication, none of which makes sense to be cached. If you find a use case for streaming caching open an issue! 😺
