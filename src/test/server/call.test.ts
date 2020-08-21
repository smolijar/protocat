import { ProtoCat, Middleware, ServiceImplementation } from '../..'
import {
  GreetingService,
  IGreetingService,
} from '../../../dist/test/api/v1/hello_grpc_pb'
import { path2Fragments } from '../../lib/misc/grpc-helpers'

describe('Context extension types', () => {
  interface MyContext {
    uid: string
  }
  const app = new ProtoCat<MyContext>()

  // Inferred middleware context
  app.use((call, next) => {
    call.uid = '123'
  })

  // Explicit middleware context
  const mdw: Middleware<MyContext> = (call, next) => {
    call.uid = '123'
  }
  app.use(mdw)

  const unaryHandler: ServiceImplementation<
    IGreetingService,
    MyContext
  >['unary'] = call => call.uid

  const serviceImpl: ServiceImplementation<IGreetingService, MyContext> = {
    bidi: call => call.uid,
    clientStream: call => call.uid,
    serverStream: call => call.uid,
    unary: call => call.uid,
  }
  // Service definition inferred and explicit
  app.addService(GreetingService, {
    bidi: call => call.uid,
    unary: [unaryHandler],
    serverStream: call => call.uid,
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
