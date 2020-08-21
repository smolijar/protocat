import { ProtoCat, Middleware, ServiceImplementation } from '../..'
import {
  GreetingService,
  IGreetingService,
} from '../../../dist/test/api/v1/hello_grpc_pb'

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
