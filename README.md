<div align="center">

![](https://gist.githubusercontent.com/grissius/2125f85d5983d980e1696f99b9b77bc7/raw/9c82b3406e4b1c9eb9d21746b67e22fc8f56dfe1/logo.png)

# protocat

Modern, minimalist type-safe gRPC framework for Node.js

</div>

## Quickstart

```typescript
import { ProtoCat } from 'protocat'
import { CatService } from '../dist/cat_grpc_pb' // Generated service definition

app = new ProtoCat()
app.addService(CatService, {
    getCat: async call => {
        const cat = await getCatByName(call.request?.getName() ?? '')
        call.response.setName(cat.name)
            .setHealth(cat.health)
            .setLevel(cat.level)
            .setClass(cat.profession ?? 'warrior')
    }
}

app.start('0.0.0.0:3000', ServerCredentials.createInsecure())
```

## Features

### Technology

Protocat uses pure JavaScript gRPC client implementation `@grpc/grpc-js`

### Middleware

#### Usage

Middlewares can be registered

1. either globally, with `app.use` for all incoming requests,
2. or at method level with `addService`, where instead of a single handler, an array of handlers can be provided (handler and middleware have the same API).

```typescript
app.use(call => {
  /*...*/
})
app.addService(CatService, {
  getCat: [
    call => {
      /*...*/
    },
    call => {
      /*...*/
    },
  ],
})
```

Note that grpc does not provide API to intercept all incoming requests, only to provide handlers to specific RPCs. That is why even global Protocat's middlewares do not handle requests that request unimplemented gRPC service for example.

#### `next` function

Here is an example of a simple logger middleware. Apart from `call` each middleware (handler alike) has a `next` function. This is callstack of all subsequent middlewares and handlers. This feature is demonstrated in a simple logger middleware bellow.

```typescript
app.use(async (call, next) => {
  const start = performance.now()
  console.log(` --> ${call.path}`, {
    request: call.request?.toObject(),
    clientMetadata: call.metadata.getMap(),
  })
  await next()
  console.log(` <-- ${call.path}`, {
    response: call.response?.toObject(),
    durationMillis: performance.now() - start,
    initialMetadata: call.initialMetadata.getMap(),
    trailingMetadata: call.trailingMetadata.getMap(),
  })
})
```

#### Call cascading

All middlewares are executed in order they were registered, followed by an execution of handlers is provided order, regardless of middleware-service order. Not that in the following example, `C` middleware is registered after `CatService` and it is still called, even before the handlers.

```typescript
app.use(async (call, next) => {
  console.log('A1')
  await next()
  console.log('A2')
})
app.use(async (call, next) => {
  console.log('B1')
  await next()
  console.log('B2')
})
app.addService(CatService, {
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
app.use(async (call, next) => {
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

## Error handling

### Simple handler

Error handling can be solved with a custom simple middleware, thanks to existing `next` cascading mechanism:

```typescript
app.use(async (call, next) => {
  try {
    await next()
  } catch (error) {
    console.error(error)
    throw error
  }
})
```

The `next` call contains a complete call stack from the following middlewares/handlers only, that is why it is recommended to use your error-handling middleware as one of the firsts.

### Advanced handler

The simple handler is a perfectly valid option for the synchronous (or asynchronous, "linear") code: like unary calls. In that scenario, you don't need more than that. When working with streams however, the situation is more complicated. When an error is emitted on a stream, it "cannot" be caught and re-thrown, since there could be several listeners on the emitter, which are already responding to that event.

There is an `onError` middleware creator, that can intercept all errors including the stream errors. It can be used not only to log the errors (and pass them on), but also to consume the errors (and not propagate them to the client), rethrow them, or change them.

```typescript
import { onError } from 'protocat'

app.use(
  onError((e, call) => {
    // Set metadata
    call.initialMetadata.set('error-code', e.code)
    call.trailingMetadata.set('error-code', e.code)

    // Consume the error
    if (notThatBad(e)) {
      if (call.type === CallType.ServerStream || call.type === CallType.Bidi) {
        // sync error not re-thrown on stream response, should end
        call.end()
      }
      return
    }

    // Throw an error
    if (!expected(e)) {
      e.message = 'Server error'
    }
    throw e
  })
)
```

- The handler is called with error and current call for all errors (rejects from handlers, error emits from streams), meaning there can be theoretically more errors per request (multiple emitted errors) and some of them can be handled even after the executon of the next chain (error emits).
- Provided function can be sync on async. It can throw (or return rejected promise), but any other return value is ignored
- Both initial and trailing metadata are available for change (unless you sent them manually)
- In order to achieve "re-throwing", `emit` function on call is patched by `onError`. When calling `call.emit('error', e)`, the error is actually emitted in the stream only when the handler throws a new error. This means that when you emit an error in the middleware and consume it in the handler, streams are left "hanging", not errored and likely not even ended. If you truly wish to not propagate the error to client, it is recommended to end the streams in the handler. (This is not performed automatically, since there is no guarantee there should be no more than one error)

### Details

## Roadmap

- [x] Middleware
- [x] Error handling
- [x] Type safety

- [x] call / context terminology
- [x] call / stream terminology
- [x] status / metadata test naming confusion
- [ ] metadata readme section
- [ ] starter project
- [ ] gRPC client
- [ ] Call pool
- [x] Context type extension
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
