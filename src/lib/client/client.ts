import * as grpc from '@grpc/grpc-js'
import { stubToType, CallType } from '../call-types'
import { TypedOnData, OmitNeverKeys } from '../misc/type-helpers'

type UnaryRequestSetup<Req> = (
  req: Req,
  metadata: grpc.Metadata,
  options: Partial<grpc.CallOptions>
) => any
type StreamRequestSetup<Req> = (
  metadata: grpc.Metadata,
  options: Partial<grpc.CallOptions>
) => any
type BidiCall<Req, Res> = (setup?: StreamRequestSetup<Req>) => {
  call: TypedOnData<grpc.ClientDuplexStream<Req, Res>, Res>
  metadata: Promise<grpc.Metadata>
  status: Promise<grpc.StatusObject>
}
type ServerStreamCall<Req, Res> = (setup?: UnaryRequestSetup<Req>) => {
  call: TypedOnData<grpc.ClientReadableStream<Res>, Res>
  metadata: Promise<grpc.Metadata>
  status: Promise<grpc.StatusObject>
}
type ClientStreamCall<Req, Res> = (setup?: StreamRequestSetup<Req>) => {
  response: Promise<Res>
  call: grpc.ClientWritableStream<Req>
  metadata: Promise<grpc.Metadata>
  status: Promise<grpc.StatusObject>
}
type UnaryCall<Req, Res> = (setup?: UnaryRequestSetup<Req>) => Promise<{
  response: Res
  call: grpc.ClientUnaryCall
  metadata: grpc.Metadata
  status: grpc.StatusObject
}>
type UpdatedClient_<C> = C extends grpc.Client ? UpdatedClient<C> : never
type UpdatedClient<C extends grpc.Client> = OmitNeverKeys<
  {
    [K in keyof C]: C[K] extends (
      request: infer Req,
      metadata?: grpc.Metadata,
      options?: Partial<grpc.CallOptions>
    ) => grpc.ClientReadableStream<infer Res>
      ? ServerStreamCall<Req, Res>
      : C[K] extends (
          metadata: grpc.Metadata,
          options?: Partial<grpc.CallOptions>
        ) => grpc.ClientDuplexStream<infer Req, infer Res>
      ? BidiCall<Req, Res>
      : C[K] extends (
          request: infer Req,
          metadata: grpc.Metadata,
          options: Partial<grpc.CallOptions>,
          callback: (
            error: grpc.ServiceError | null,
            response: infer Res
          ) => void
        ) => grpc.ClientUnaryCall
      ? UnaryCall<Req, Res>
      : C[K] extends (
          metadata: grpc.Metadata,
          options: Partial<grpc.CallOptions>,
          callback: (
            error: grpc.ServiceError | null,
            response: infer Res
          ) => void
        ) => grpc.ClientWritableStream<infer Req>
      ? ClientStreamCall<Req, Res>
      : never
  }
>

const updateClientInstance = <C extends grpc.Client>(
  grpcClient: C
): UpdatedClient<C> => {
  const resClient: any = {}
  for (const rpcName in grpcClient) {
    const rpc: any = grpcClient[rpcName]
    const type = stubToType(rpc)
    const RequestType = rpc.requestType
    if (type === CallType.Unary) {
      resClient[rpcName] = async (setup: any) => {
        let metadata
        let status
        let call: any
        const request = new RequestType()
        const clientMeta = new grpc.Metadata()
        const options = {}
        await setup?.(request, clientMeta, options)
        const response = await new Promise((resolve, reject) => {
          call = rpc.bind(grpcClient)(
            request,
            clientMeta,
            options,
            (err: Error, res: any) => (err ? reject(err) : resolve(res))
          )
          metadata = new Promise(resolve => call.on('metadata', resolve))
          status = new Promise(resolve => call.on('status', resolve))
        })
        return {
          call,
          response,
          metadata: await metadata,
          status: await status,
        }
      }
    } else if (type === CallType.ServerStream) {
      resClient[rpcName] = (setup: any) => {
        const request = new RequestType()
        const clientMeta = new grpc.Metadata()
        const options = {}
        setup?.(request, clientMeta, options)
        const call = rpc.bind(grpcClient)(request, clientMeta, options)
        const metadata = new Promise(resolve => call.on('metadata', resolve))
        const status = new Promise(resolve => call.on('status', resolve))
        return { call, metadata, status }
      }
    } else if (type === CallType.ClientStream) {
      let metadata: any
      let status: any
      let call: any
      resClient[rpcName] = (setup: any) => {
        const clientMeta = new grpc.Metadata()
        const options = {}
        setup?.(clientMeta, options)
        const response = new Promise((resolve, reject) => {
          call = rpc.bind(grpcClient)(
            clientMeta,
            options,
            (err: Error, res: any) => (err ? reject(err) : resolve(res))
          )
          metadata = new Promise(resolve => call.on('metadata', resolve))
          status = new Promise(resolve => call.on('status', resolve))
        })
        return { call, response, metadata, status }
      }
    } else if (type === CallType.Bidi) {
      let metadata: any
      let status: any
      let call: any
      resClient[rpcName] = (setup: any) => {
        const clientMeta = new grpc.Metadata()
        const options = {}
        setup?.(clientMeta, options)
        call = rpc.bind(grpcClient)(clientMeta, options)
        metadata = new Promise(resolve => call.on('metadata', resolve))
        status = new Promise(resolve => call.on('status', resolve))
        return { call, metadata, status }
      }
    }
  }
  return resClient
}

export const createClient = <
  D extends
    | (new (...args: any[]) => grpc.Client)
    | Record<string, new (...args: any[]) => grpc.Client>
>(
  clientDef: D,
  address: string,
  creds?: grpc.ChannelCredentials,
  options?: Partial<grpc.ClientOptions>
): D extends new (...args: any[]) => infer C
  ? UpdatedClient_<C>
  : {
      [K in keyof D]: D[K] extends new (...args: any[]) => infer C_
        ? UpdatedClient_<C_>
        : never
    } => {
  if ('prototype' in clientDef) {
    const Client: new (...args: any[]) => grpc.Client = clientDef as any
    return updateClientInstance(
      new Client(
        address,
        creds ?? grpc.ChannelCredentials.createInsecure(),
        options
      )
    ) as any
  } else {
    const res: any = {}
    const clientObj: Record<string, new (...args: any[]) => grpc.Client> =
      clientDef as any
    for (const key in clientObj) {
      res[key] = updateClientInstance(
        new clientObj[key](
          address,
          creds ?? grpc.ChannelCredentials.createInsecure(),
          options
        )
      )
    }
    return res
  }
}
