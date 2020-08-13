<div align="center">

![](https://gist.githubusercontent.com/grissius/2125f85d5983d980e1696f99b9b77bc7/raw/9c82b3406e4b1c9eb9d21746b67e22fc8f56dfe1/logo.png)

# protocat

Modern, minimalist type-safe gRPC framework for Node.js

</div>

## Quickstart

```typescript
import { Server } from 'protocat'
import { CatService } from '../dist/cat_grpc_pb' // Generated service definition

server = new Server()
server.addService(CatService, {
    getCat: async call => {
        const cat = await getCatByName(call.request?.getName() ?? '')
        call.response.setName(cat.name)
            .setHealth(cat.health)
            .setLevel(cat.level)
            .setClass(cat.profession ?? 'warrior')
    }
}

server.start('0.0.0.0:3000', ServerCredentials.createInsecure())
```

## Features

### Technology

Protocat uses pure JavaScript gRPC client implementation `@grpc/grpc-js`

### Middleware

#### Usage

Middlewares can be registered

1. either globally, with `server.use` for all incoming requests,
2. or at method level with `addService`, where instead of a single handler, an array of handlers can be provided (handler and middleware have the same API).

```typescript
server.use(ctx => {
  /*...*/
})
server.addService(CatService, {
  getCat: [
    ctx => {
      /*...*/
    },
    ctx => {
      /*...*/
    },
  ],
})
```

Note that grpc does not provide API to intercept all incoming requests, only to provide handlers to specific RPCs. That is why even global Protocat's middlewares do not handle requests that request unimplemented gRPC service for example.

#### `next` function

Here is an example of a simple logger middleware. Apart from `context` each middleware (handler alike) has a `next` function. This is callstack of all subsequent middlewares and handlers. This feature is demonstrated in a simple logger middleware bellow.

```typescript
server.use(async (ctx, next) => {
  const start = performance.now()
  console.log(` --> ${ctx.path}`, {
    request: ctx.request?.toObject(),
    clientMetadata: ctx.metadata.getMap(),
  })
  await next()
  console.log(` <-- ${ctx.path}`, {
    response: ctx.response?.toObject(),
    durationMillis: performance.now() - start,
    initialMetadata: ctx.initialMetadata.getMap(),
    trailingMetadata: ctx.trailingMetadata.getMap(),
  })
})
```

#### Call order

All middlewares are executed in order they were registered, followed by an execution of handlers is provided order, regardless of middleware-service order. Not that in the following example, `C` middleware is registered after `CatService` and it is still called, even before the handlers.

```typescript
server.use(async (ctx, next) => {
  console.log('A1')
  await next()
  console.log('A2')
})
server.use(async (ctx, next) => {
  console.log('B1')
  await next()
  console.log('B2')
})
server.addService(CatService, {
  getCat: [
    async (call, next) => {
      console.log('D1')
      await next()
      console.log('D2')
    },
    async (call, next) => {
      console.log('E1')
      await next()
      console.log('E2')
    },
  ],
})
server.use(async (ctx, next) => {
  console.log('C1')
  await next()
  console.log('C2')
})

// --> getCat
// A1            (middleware)
//   B1          (middleware)
//     C1        (middleware)
//       D1      (handler)
//         E1    (handler)
//         E2    (handler)
//       D2      (handler)
//     C2        (middleware)
//   B2          (middleware)
// A2            (middleware)
```

## Roadmap

- [x] Middleware
- [ ] Error handling
- [ ] Type safety

- [ ] Call pool
- [ ] Context type extension
- [ ] Partial definition
- [ ] Serialization level caching
- [ ] Docs

## See also

- [Mali](https://mali.js.org/) - Minimalistic Node.js gRPC microservice framework
- [BloomRPC](https://github.com/uw-labs/bloomrpc) - GUI Client for GRPC Services
- [ghz](https://github.com/bojand/ghz) - Simple gRPC benchmarking and load testing tool
- [grpc-health-probe](https://github.com/grpc-ecosystem/grpc-health-probe) - A command-line tool to perform health-checks for gRPC applications in Kubernetes etc.

## License

This project is licensed under [MIT](./LICENSE).
