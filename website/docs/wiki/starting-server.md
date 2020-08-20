---
title: Starting a server
---

```typescript
import { ProtoCat } from 'protocat'
import { ServerCredentials } from '@grpc/grpc-js'
import { CatRegisterService } from '../cat_grpc_pb'

const findCat = (name: string) =>
  Promise.resolve({
    name,
    level: Math.round(Math.random() * 10),
    health: Math.random() * 100,
  })

const app = new ProtoCat()

app.addService(CatRegisterService, {
  getCat: async call => {
    const cat = await findCat(call.request.getName())
    call.response.setName(cat.name).setLevel(cat.level).setHealth(cat.health)
  },
})

app.start('0.0.0.0:3000', ServerCredentials.createInsecure())
```

Test your running server with GUI client [BloomRPC](https://github.com/uw-labs/bloomrpc) or CLI tool [grpcurl](https://github.com/fullstorydev/grpcurl):

```bash
grpcurl \
    -proto cat.proto \
    -plaintext \
    -d '{"name": "ProtoCat"}' \
    localhost:3000 cats.v1.CatRegister.GetCat
```

And you should get a response! 🎉

```json
{
  "name": "ProtoCat",
  "health": 79.40545,
  "level": "1"
}
```
