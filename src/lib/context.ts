import * as grpc from '@grpc/grpc-js'
import { RemoveIdxSgn } from './type-helpers'
import { CallType } from './call-types'

/** ProtoCat context enrichment for incoming calls */
export type ProtoCatContext<Res, Type extends CallType> = {
  /** Server initial metadata (sent automatically for unary / client stream) */
  initialMetadata: grpc.Metadata
  /** Manually send initial metadata for server stream / bidi */
  flushInitialMetadata: () => void
  /** Trailing metadata (sent automatically) */
  trailingMetadata: grpc.Metadata
  /** Type of call */
  type: Type
} & (Type extends CallType.UNARY | CallType.CLIENT_STREAM
  ? {
      /** Ready response instance initialized for every call */
      response: Res
    }
  : {})

export type NextFn = () => Promise<void>
export type ServiceHandlerUnary<Req, Res> = (
  call: ProtoCatContext<Res, CallType.UNARY> & grpc.ServerUnaryCall<Req, Res>,
  next: NextFn
) => any
export type ServiceHandlerServerStream<Req, Res> = (
  call: ProtoCatContext<Res, CallType.SERVER_STREAM> &
    grpc.ServerWritableStream<Req, Res>,
  next: NextFn
) => any
export type ServiceHandlerClientStream<Req, Res> = (
  call: ProtoCatContext<Res, CallType.CLIENT_STREAM> &
    grpc.ServerReadableStream<Req, Res>,
  next: NextFn
) => any
export type ServiceHandlerBidi<Req, Res> = (
  call: ProtoCatContext<Res, CallType.BIDI> & grpc.ServerDuplexStream<Req, Res>,
  next: NextFn
) => any

type AnyContext =
  | (ProtoCatContext<any, CallType.UNARY> & grpc.ServerUnaryCall<any, any>)
  | (ProtoCatContext<any, CallType.SERVER_STREAM> &
      grpc.ServerWritableStream<any, any>)
  | (ProtoCatContext<any, CallType.CLIENT_STREAM> &
      grpc.ServerReadableStream<any, any>)
  | (ProtoCatContext<any, CallType.BIDI> & grpc.ServerDuplexStream<any, any>)

export type Middleware = (ctx: AnyContext, next: NextFn) => any

/** Convert a single method definition to service handler type */
type MethodDef2ServiceHandler<H> = H extends grpc.MethodDefinition<
  infer Request,
  infer Res
>
  ? H['requestStream'] extends true
    ? H['responseStream'] extends true
      ? ServiceHandlerBidi<Request, Res>
      : ServiceHandlerClientStream<Request, Res>
    : H['responseStream'] extends true
    ? ServiceHandlerServerStream<Request, Res>
    : ServiceHandlerUnary<Request, Res>
  : never

/** Create service handler type for whole client definition */
export type ServiceImplementation<T> = RemoveIdxSgn<
  { [M in keyof T]: MethodDef2ServiceHandler<T[M]> }
>
