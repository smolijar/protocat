import { ProtoCat } from '../..'
import { CatService, CatClient } from '../../../dist/test/api/v1/cat_grpc_pb'
import { Cat } from '../../../dist/test/api/type/cat_pb'
import { ChannelCredentials } from '@grpc/grpc-js'
import {
  GetCatRequest,
  WatchCatsRequest,
  FeedCatsRequest,
  ShareLocationRequest,
  ShareLocationResponse,
} from '../../../dist/test/api/v1/cat_pb'

const ADDR = '0.0.0.0:3000'
describe('CatService (real world example)', () => {
  let app: ProtoCat
  test('Setup and run server', async () => {
    app = new ProtoCat()
    app.addService(CatService, {
      getCat: call => call.response.setName(call.request?.getName() ?? ''),
      watchCats: async call => {
        call.flushInitialMetadata()
        for (let i = 0; ; i++) {
          await new Promise(resolve => setTimeout(resolve, 50))
          if (call.cancelled) {
            break
          }
          call.write(new Cat().setName(['Fred', 'Mat', 'Hat'][i % 3]))
        }
      },
      shareLocation: async call => {
        let travelled = 0
        let lastLat: number | null = null
        let lastLng: number | null = null
        call.on('data', req => {
          travelled +=
            lastLat && lastLng
              ? Math.sqrt(
                  Math.pow(lastLat - req.getLat(), 2) +
                    Math.pow(lastLng - req.getLng(), 2)
                )
              : 0
          lastLat = req.getLat()
          lastLng = req.getLng()
        })
        await new Promise<void>(resolve =>
          call.on('end', () => {
            call.response = new ShareLocationResponse().setTravelledMeters(
              travelled
            )
            resolve()
          })
        )
      },
      feedCats: call => {
        call.initialMetadata.set('type', 'initialBidi')
        call.trailingMetadata.set('type', 'trailingBidi')
        call.flushInitialMetadata()
        call.on('data', req => {
          call.write(new Cat().setName('Foo'))
        })
        call.on('end', () => {
          call.end()
        })
      },
    })
    await app.start(ADDR)
  })
  test('GetCat (Unary)', async () => {
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    const cat = await new Promise<Cat>((resolve, reject) => {
      client.getCat(new GetCatRequest().setName('Proto'), (err, res) =>
        err ? reject(err) : resolve(res)
      )
    })
    expect(cat.getName()).toBe('Proto')
  })
  test('WatchCats (client-cancelled server side stream)', async () => {
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    await new Promise<void>((resolve, reject) => {
      const call = client.watchCats(new WatchCatsRequest())
      const seenCats: string[] = []
      call.on('data', cat => {
        seenCats.push(cat.getName())
        if (seenCats.length > 10) {
          call.cancel()
          resolve()
        }
      })
      call.on('error', (e: any) => (e.code === 1 ? resolve() : reject(e)))
    })
  })
  test('ShareLocation (client streaming)', async () => {
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    const res = await new Promise<ShareLocationResponse>((resolve, reject) => {
      const call = client.shareLocation((err, res) =>
        err ? reject(err) : resolve(res)
      )
      for (let i = 0; i < 10; ++i) {
        call.write(new ShareLocationRequest().setLat(i * 2).setLng(i))
      }
      call.end()
    })
    expect(res.getTravelledMeters()).toBeGreaterThan(0)
  })
  test('FeedCats (bidi)', async () => {
    const client = new CatClient(ADDR, ChannelCredentials.createInsecure())
    await new Promise<ShareLocationResponse>((resolve, reject) => {
      const call = client.feedCats()
      let fedCats = 0
      call.write(new FeedCatsRequest().setFood('fish'))
      call.on('end', resolve)
      call.on('data', res => {
        if (fedCats++ < 3) {
          call.write(new FeedCatsRequest().setFood('fish'))
        } else {
          call.end()
        }
      })
    })
  })
  test('Stop server', async () => {
    await app.stop()
  })
})
