---
title: Error handling
---

## Simple handler

Basic error handling can be solved with a custom simple middleware, thanks to existing `next` cascading mechanism:

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

## Advanced handler

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
