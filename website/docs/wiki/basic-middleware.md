---
title: Basic middleware
---

```typescript
import { ProtoCat } from 'protocat'

const app = new ProtoCat()

app.addService(/* ... */)
app.use(call => {
  console.log(`[${call.type}] ${call.path}`)
  return next()
})
```

Before or after adding a service, you can add middlewares that get invoked on each request for all call types.

There is more to do with middlewares and more to know about them, see advanced guides!
