import { ProtoCat } from '../../..'
import {
  GreetingService,
  GreetingClient,
  IGreetingService,
} from '../../../../dist/test/api/v1/hello_grpc_pb'
import {
  createCache,
  CacheImplementation,
} from '../../../lib/server/middleware/cache'
import { performance } from 'perf_hooks'
import { ServiceImplementation } from '../../../lib/server/call'
import { createClient } from '../../../lib/client/client'

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
    app.use(
      createCache(cache, (call, hit, hash) => {
        call.initialMetadata.set('cache', hit ? 'hit' : 'miss')
        call.initialMetadata.set('cache-key', hash)
      })
    )
    await app.start(ADDR)
  })
  describe('Caching', () => {
    const client = createClient(GreetingClient, ADDR)
    beforeEach(() => {
      cache.set.mockClear()
      cache.get.mockClear()
      cache.hash.mockClear()
      unary.mockClear()
      c = {}
    })
    test('Cache miss, cache hit (invocation tests)', async () => {
      const call = () =>
        client
          .unary(req => req.setName('Whiskers'))
          .then(({ response }) => response)
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
      const results = await Promise.all(
        requests.map(request => client.unary(req => req.setName(request)))
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

      // Correct responses and hit/mis via callback metadata
      const seen: Record<string, string> = {}
      results.forEach(({ metadata, response }, i) => {
        if (seen[requests[i]]) {
          expect(metadata.getMap().cache).toBe('hit')
          expect(response.getName()).toBe(seen[requests[i]])
        } else {
          expect(metadata.getMap().cache).toBe('miss')
        }
        seen[requests[i]] = response.getName()
      })
    })
  })
})
