import { ProtoCat } from '../..'
import { GreetingService, IGreetingService } from '../../../dist/test/api/v1/hello_grpc_pb'
import { path2Fragments } from '../../lib/misc/grpc-helpers'
import {
  ExtractMiddleware,
  ExtractPath,
  ExtractServices,
} from '../../lib/server/application'
import { Middleware } from '../../lib/server/call'

describe('Context extension types', () => {
  const app = new ProtoCat({ GreetingService }, () => ({
    uid: '',
  }))

  type x = ExtractPath<typeof app>

  // Inferred middleware context
  app.use((call, next) => {
    call.uid = '123'
  })

  // Explicit middleware context
  const mdw: ExtractMiddleware<typeof app> = (call, next) => {
    call.uid = '123'
    if (call.path === '/cats.v1.Greeting/ClientStream') {
      // good
    }
    // @ts-expect-error
    if (call.path === '/cats.v1.zblept/ClientStream') {
      // causes error, typo in path
    }
  }
  app.use(mdw)

  const unaryHandler: ExtractServices<
    typeof app
  >['GreetingService']['unary'] = call => call.uid

  const serviceImpl: ExtractServices<typeof app>['GreetingService'] = {
    bidi: call => call.uid,
    clientStream: call => call.uid,
    serverStream: call => call.uid,
    unary: call => call.uid,
  }
  const genMiddleware: Middleware<{ uid: string }> = call => call
  // Service definition inferred and explicit
  app.addService('GreetingService', {
    bidi: call => call.uid,
    unary: [unaryHandler],
    serverStream: [genMiddleware, call => call.uid],
    clientStream: [call => call.uid, serviceImpl.clientStream],
  })
  test('Type check', jest.fn())
})
describe('path2Fragments', () => {
  test('Parses package, service and method', () => {
    const paths = [
      {
        path: '/cats.v1.Cat/GetCat',
        expect: { package: 'cats.v1', service: 'Cat', method: 'GetCat' },
      },
      {
        path: '/Cat/GetCat',
        expect: { package: '', service: 'Cat', method: 'GetCat' },
      },
      {
        path: '',
        expect: { package: '', service: '', method: '' },
      },
    ]
    for (const p of paths) {
      expect(path2Fragments(p.path)).toMatchObject(p.expect)
    }
  })
})
