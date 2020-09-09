import { ProtoCat } from '../../..'
import {
  GreetingService,
  GreetingClient,
  IGreetingService,
} from '../../../../dist/test/api/v1/hello_grpc_pb'
import { ChannelCredentials } from '@grpc/grpc-js'
import { Hello } from '../../../../dist/test/api/v1/hello_pb'
import {
  createCache,
  CacheImplementation,
} from '../../../lib/server/middleware/cache'
import { performance } from 'perf_hooks'
import { ServiceImplementation } from '../../../lib/server/call'

const inf = <R>() => <T extends R>(_: T) => _
const uniq = <T>(xs: T[]) => Array.from(new Set(xs))

const ADDR = '0.0.0.0:3000'
let c: Record<string, Buffer> = {}
const cache = inf<CacheImplementation>()({
  set: jest.fn((k, v) => {
    c[k] = v
  }),
  get: jest.fn(k => c[k]),
  hash: jest.fn(call => call.request.toArray().join('-')),
})
const unary = inf<ServiceImplementation<IGreetingService>['unary']>()(
  jest.fn(call => {
    call.response.setName(performance.now().toString())
  })
)
describe('Cache middleware', () => {
  const app = new ProtoCat()
  afterAll(() => app.stop())
  test('Setup', async () => {
    app.addService(GreetingService, {
      unary,
      ...({} as any), // we skip def on non-unary
    })
    app.use(createCache(cache))
    await app.start(ADDR)
  })
  describe('Caching', () => {
    const client = new GreetingClient(ADDR, ChannelCredentials.createInsecure())
    beforeEach(() => {
      cache.set.mockClear()
      cache.get.mockClear()
      cache.hash.mockClear()
      unary.mockClear()
      c = {}
    })
    test('Cache miss, cache hit (invocation tests)', async () => {
      const call = () =>
        new Promise<Hello>((resolve, reject) => {
          client.unary(new Hello().setName('Whiskers'), (err, res) =>
            err ? reject(err) : resolve(res)
          )
        })
      const res1 = await call()

      expect(cache.hash).toBeCalledTimes(1)
      expect(cache.get).toBeCalledTimes(1)
      expect(cache.set).toBeCalledTimes(1)
      expect(unary).toBeCalledTimes(1)

      const res2 = await call()

      expect(cache.hash).toBeCalledTimes(2)
      expect(cache.get).toBeCalledTimes(2)
      expect(cache.set).toBeCalledTimes(1)
      expect(unary).toBeCalledTimes(1)
      expect(res2.getName()).toBe(res1.getName())
    })
    test('Repeated requests (invocation tests)', async () => {
      const requests = 'meeeeeoooweee!'.split('')
      await Promise.all(
        requests.map(
          x =>
            new Promise<Hello>((resolve, reject) => {
              client.unary(new Hello().setName(x), (err, res) =>
                err ? reject(err) : resolve(res)
              )
            })
        )
      )
      // Hash called for each request
      expect(cache.hash).toBeCalledTimes(requests.length)
      // Cache got for each request
      expect(cache.get).toBeCalledTimes(requests.length)
      // Set only for misses
      expect(cache.set).toBeCalledTimes(uniq(requests).length)
      // Handler called only for misses
      expect(unary).toBeCalledTimes(uniq(requests).length)
      // Handler called only for unique request strings
      expect(unary.mock.calls.map(([call]) => call.request.getName())).toEqual(
        uniq(requests)
      )
    })
  })
})
