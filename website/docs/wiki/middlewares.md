---
title: Middlewares
---

## Usage

Middlewares can be registered

1. either globally, with `app.use` for all incoming requests,
2. or at method level with `addService`, where instead of a single handler, an array of handlers can be provided (handler and middleware have the same API).

```typescript
app.use((call, next) => next()) // global middleware
app.addService(CatService, {
  getCat: [
    (call, next) => next(), // getCat middleware
    (call, next) => next(), // getCat handler
  ],
})
```

:::important

Note that grpc does not provide API to intercept all incoming requests, it only provides handlers to specific RPCs. That is why even global ProtoCat's middlewares do not handle requests that request unimplemented gRPC service for example.

:::

## `next` function

Here is an example of a simple logger middleware. Apart from `call`, each middleware (handler alike) receives a `next` function. This is callstack of all subsequent middlewares and handlers. This feature is demonstrated in a simple logger middleware bellow.

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

:::caution

Unless you want to stop execution of the subsequent middlewares, you must call `next`. Not awaiting (or returning) it will probably result in unexpected behavior, especially in calls without server-streaming.

:::

## Call cascading

All middlewares are executed in order they were registered, followed by an execution of handlers in provided order, regardless of middleware-service order. Note that in the following example, `C` middleware is registered after `CatService` and it is still called, even before the handlers.

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
