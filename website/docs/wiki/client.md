---
title: Client
---

For doing a server abstraction, there was a simple reason: lack of middlewares which are (almost) an essential concept to backend server development. With the client, there are no missing features per se, but the interface is a bit basic, extremely verbose and somewhat painful to work with. ProtoCat's client aims at providing a modern familiar interface, that does not take any power of the underlying layer away and preserves (or improves at some points) type safety.

## Getting started - Unary call

Compare the following implementations that achieve the same goal with native grpc interface for node, and ProtoCat's client abstraction with `createClient`:

1. Initialize client
2. Setup request message and set client metadata
3. Obtain server's response, initial and trailing metadata

```typescript
const client = createClient(CatService, ADDR)
const { status, metadata, response } = await client.getCat((req, metadata) => {
  req.setName('Meow')
  metadata.set('authorization', 'cat-permit')
})
```

```typescript
const client = new CatService(ADDR, ChannelCredentials.createInsecure())
let metadata: Promise<Metadata> = null as any
let status: Promise<StatusObject> = null as any
const clientMeta = new Metadata()
clientMeta.set('authorization', 'cat-permit')
const hello = await new Promise<GetCatResponse>((resolve, reject) => {
  const call = client.getCat(
    new GetCatRequest().setName('Meow'),
    clientMeta,
    (err, res) => (err ? reject(err) : resolve(res))
  )
  metadata = new Promise(resolve => call.on('metadata', resolve))
  status = new Promise(resolve => call.on('status', resolve))
})
```

## Call types

While the ProtoCat's client really shines on unary calls, it does support all gRPC call types. Following the premise of keeping the power of underlying implementation, we must tamper with the stream API.

### Server stream

```typescript
const { status, metadata, call } = client.watchCats(req =>
  req.onlyWithPointyEars(true)
)
const acc: string[] = []
call.on('data', res => acc.push(res.getName()))
await new Promise(resolve => call.on('end', resolve))
```

### Client stream

```typescript
const { status, metadata, call, response } = client.shareLocation()
'meeoaw!'.split('').forEach(c => {
  call.write(
    new ShareLocationRequest()
      .setLng(c.charCodeAt())
      .setLat(Math.random() * c.charCodeAt())
  )
})
call.end()
await response
```

### Bidi

```typescript
const { status, metadata, call } = await client.feedCats()
const acc: string[] = []
call.on('data', res => acc.push(res.getName()))
;['lasagne', 'cake', 'fish'].forEach(dish => {
  call.write(new FeedCatsRequest().setFood(dish))
})
call.end()
await new Promise(resolve => call.on('end', resolve))
```

## Client initialization

`createClient` accepts the same arguments as the native client, with additional first argument being a _client definition_:

1. Address is mandatory
2. Credentials are mandatory on the underlying implementation, when not supplied insecure channel credentials are provided
3. Client options

The helper creates an instance in a closure and provides stub with the updated API.

Each call instead of getting arguments for `request` (some types), `metadata` and `options`, is provided a setup function, in which user can set the prepared objects.

The client definition is either a client class, or object of client classes:

```typescript
const client = createClient({ cat: CatService, dog: DogService }, ADDR)
await client.cat.getCat()
await client.dog.getDog()
```

This way you can have a single client to access multiple services of a single API, with sharing the connection configuration. In this case, there are several client instances created under the hood with the same configuration and the types are joyfully inferred from the definition!

## Interceptors

Exciting feature of gRPC clients are interceptors. They are like middlewares for clients, allowing you to add hooks for your client actions. It's a powerful concept that allows for uniform caching, logging or retry mechanisms.

The native API is as always basic, verbose and powerful. For many simple use-cases too overwhelming. But since ProtoCat aims to support potentially existing intereceptors and yet provide an elegant way to define custom ones, it proves some basic creators to handle the basic use cases.

:::tip
Need more? You can create your custom interceptor that ones just the thing you need. See [gRPC for NodeJS Client Interceptors](https://github.com/grpc/proposal/blob/master/L5-node-client-interceptors.md) that has detailed overview of the specs the implementation follows.
:::

### Access log interceptor

Middleware-like interface for convenient logging

```typescript
const client = createClient(
  CatService,
  ADDR,
  ChannelCredentials.createInsecure(),
  {
    interceptors: [
      accessLogInterceptor(async (ctx, next) => {
        console.log(`${ctx.options.method_definition.path} -->`)
        const st = await next()
        console.log(`${ctx.options.method_definition.path} <-- (${st.details})`)
      }),
    ],
  }
)
```

### Metadata interceptor

If you are required to set client metadata on each request (for example to authenticate), you can let this interceptor take care of that

```typescript
const client = createClient(
  CatService,
  ADDR,
  ChannelCredentials.createInsecure(),
  {
    interceptors: [
      metadataInterceptor(async (meta, opts) => {
        const bearer = getTokenForPath(opts.method_definition.path)
        meta.set('authorization', `Bearer ${bearer}`)
      }),
    ],
  }
)
```
