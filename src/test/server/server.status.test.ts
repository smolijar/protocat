import { ProtoCat } from '../..'
import { CatService, CatClient } from '../../../dist/test/api/v1/cat_grpc_pb'
import { Cat } from '../../../dist/test/api/type/cat_pb'
import { ChannelCredentials, ServiceError, status } from '@grpc/grpc-js'
import {
  GetCatRequest,
  WatchCatsRequest,
  FeedCatsRequest,
  ShareLocationRequest,
  ShareLocationResponse,
} from '../../../dist/test/api/v1/cat_pb'

const ADDR = '0.0.0.0:3000'
describe('Server Status', () => {
  let app: ProtoCat
  test('Unknown error maps to UNKNOWN gRPC code', async () => {
    app = new ProtoCat()
    app.addService({ getCat: CatService.getCat }, {
      getCat: () => Promise.reject({}),
    })
    await app.start(ADDR)
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    const error = await new Promise<ServiceError | null>((resolve, reject) => {
      client.getCat(new GetCatRequest().setName('Proto'), (err, res) =>
        err ? resolve(err) : resolve(null)
      )
    })
    expect(error?.code).toBe(status.UNKNOWN)
    await app.stop()
  })
  test('Changing status code', async () => {
    app = new ProtoCat()
    app.addService({ getCat: CatService.getCat }, {
      getCat: () => Promise.reject(Object.assign(new Error('Not found'), { code: status.PERMISSION_DENIED })),
    })
    app.use(async (call, next) => {
      try {
        await next()
      } catch (e: any) {
        if ('code' in e && e.code === status.PERMISSION_DENIED) {
          throw Object.assign(new Error('Not found'), { code: status.NOT_FOUND })
        }
      }
    })
    await app.start(ADDR)
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    const error = await new Promise<ServiceError | null>((resolve, reject) => {
      client.getCat(new GetCatRequest().setName('Proto'), (err, res) =>
        err ? resolve(err) : resolve(null)
      )
    })
    expect(error?.code).toBe(status.NOT_FOUND)
    await app.stop()
  })
})
