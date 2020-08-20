import * as grpc from '@grpc/grpc-js'
import { ChannelOptions } from '@grpc/grpc-js/build/src/channel-options'
import { ServiceImplementation, Middleware } from './call'
import { stubToType } from '../call-types'
import { bindAsync, tryShutdown } from '../misc/grpc-helpers'
import { composeMiddleware } from './middleware/compose-middleware'

/**
 * The main ProtoCat server application class
 */
export class ProtoCat<Extension = {}> {
  /** Underlying gRPC server */
  public server: grpc.Server
  /** Map of loaded generated method stubs */
  private methodDefinitions: Record<string, grpc.MethodDefinition<any, any>>
  /** Map of loaded method service implementations */
  private serviceHandlers: Record<string, Middleware[]>
  /** Global middleware functions */
  private readonly middleware: Array<Middleware<Extension>>
  constructor(options?: ChannelOptions) {
    this.server = new grpc.Server(options)
    this.methodDefinitions = {}
    this.middleware = []
    this.serviceHandlers = {}
  }

  /**
   * Add a global gRPC middleware for the application
   */
  public use(...middleware: Array<Middleware<Extension>>) {
    this.middleware.push(...middleware)
  }

  /**
   * Add service stub and its definition
   */
  public addService<
    T extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation>
  >(
    serviceDefinition: T,
    serviceImplementation: ServiceImplementation<T, Extension>
  ) {
    for (const methodName in serviceDefinition) {
      // Path is FQN with namespace to avoid collisions
      const key = serviceDefinition[methodName].path
      this.methodDefinitions[key] = serviceDefinition[methodName]
      this.serviceHandlers[key] = (this.serviceHandlers[key] || []).concat(
        // @ts-ignore
        serviceImplementation[methodName]
      )
    }
  }

  /**
   * Before start (when no middleware can be added), bind compose all registered middleware and handlers with server.register API
   * @internal
   */
  private registerHandlers() {
    for (const methodName in this.methodDefinitions) {
      const methodDefinition = this.methodDefinitions[methodName]
      const methodHandlers: any[] = this.serviceHandlers[methodName] // HandlerCS<any, any>[] | HandlerU<any, any>[] | HandlerBS<any, any>[] | HandlerSS<any, any>[]
      const wrappedHandler = wrapToHandler(
        methodDefinition,
        composeMiddleware([...this.middleware, ...methodHandlers])
      )
      const type = stubToType(methodDefinition)
      this.server.register(
        methodDefinition.path,
        wrappedHandler,
        methodDefinition.responseSerialize,
        methodDefinition.requestDeserialize,
        type
      )
    }
  }

  /**
   * Internally register handlers, bind port and start server
   */
  async start(address: string, creds: grpc.ServerCredentials) {
    this.registerHandlers()
    await bindAsync(this.server, address, creds)
    this.server.start()
  }

  /**
   * Try to shutdown server gracefully.
   */
  stop() {
    return tryShutdown(this.server)
  }
}

/**
 * Wrap ProtoCat middleware to grpc signature handler, ready for `server.register`.
 * Prepare context for middleware, await it, handle metadata, callback, errors.
 * @param methodHandler Single ProtoCat middleware
 * @internal
 */
const wrapToHandler = (
  methodDefinition: grpc.MethodDefinition<any, any>,
  methodHandler: any
) => {
  const type = stubToType(methodDefinition)
  const createContext = (call: any): any => {
    const initialMetadata = new grpc.Metadata()
    const trailingMetadata = new grpc.Metadata()
    return Object.assign(call, {
      trailingMetadata,
      initialMetadata,
      path: methodDefinition.path,
      flushInitialMetadata: () => call.sendMetadata(initialMetadata),
      type,
    })
  }

  return async (
    grpcCall: any, // grpc.ServerReadableStream<any, any> | grpc.ServerUnaryCall<any, any> | grpc.ServerDuplexStream<any, any> | grpc.ServerWritableStream<any, any>
    cb?: grpc.sendUnaryData<any> // Only for call grpc.ServerReadableStream<any, any> | grpc.ServerUnaryCall<any, any>, missing otherwise
  ) => {
    const call = createContext(grpcCall)
    // @ts-ignore: Not part of public API, but only way to pair message to method
    call.response = new methodDefinition.responseType()
    try {
      await methodHandler(call)
      call.sendMetadata(call.initialMetadata)
      if (cb) {
        cb(null, call.response, call.trailingMetadata)
      }
    } catch (e) {
      if (cb) {
        cb(e, null, call.trailingMetadata)
      } else {
        grpcCall.emit('error', e)
      }
    }
  }
}
