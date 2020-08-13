import * as grpc from '@grpc/grpc-js'
import { RemoveIdxSgn, TypedOnData } from './type-helpers'
import { CallType } from './call-types'
import { Message } from 'google-protobuf'

/** ProtoCat context enrichment for incoming calls */
export type ProtoCatContext<Req, Res, Type extends CallType> = {
  /** Server initial metadata (sent automatically for unary / client stream) */
  initialMetadata: grpc.Metadata
  /** Manually send initial metadata for server stream / bidi */
  flushInitialMetadata: () => void
  /** Trailing metadata (sent automatically) */
  trailingMetadata: grpc.Metadata
  /** RPC path "/[package].[service]/[method]", e.g. /cats.v1.Cat/GetCat */
  path: string
  /** Type of call */
  type: Type
  /** Request message: only unary and server-stream */
  request?: Req
  /** Response message: only unary and client-stream */
  response?: Res
} & (Type extends CallType.UNARY | CallType.CLIENT_STREAM
  ? {
      /** Ready response instance initialized for every call */
      response: Res
    }
  : {})

export type NextFn = () => Promise<void>
export type ServiceHandlerUnary<Req, Res> = (
  call: ProtoCatContext<Req, Res, CallType.UNARY> &
    grpc.ServerUnaryCall<Req, Res>,
  next: NextFn
) => any
export type ServiceHandlerServerStream<Req, Res> = (
  call: ProtoCatContext<Req, Res, CallType.SERVER_STREAM> &
    grpc.ServerWritableStream<Req, Res>,
  next: NextFn
) => any
export type ServiceHandlerClientStream<Req, Res> = (
  call: ProtoCatContext<Req, Res, CallType.CLIENT_STREAM> &
    TypedOnData<grpc.ServerReadableStream<Req, Res>, Req>,
  next: NextFn
) => any
export type ServiceHandlerBidi<Req, Res> = (
  call: ProtoCatContext<Req, Res, CallType.BIDI> &
    TypedOnData<grpc.ServerDuplexStream<Req, Res>, Req>,
  next: NextFn
) => any

export type AnyContext =
  | (ProtoCatContext<Message, Message, CallType.UNARY> &
      grpc.ServerUnaryCall<Message, Message>)
  | (ProtoCatContext<Message, Message, CallType.SERVER_STREAM> &
      grpc.ServerWritableStream<Message, Message>)
  | (ProtoCatContext<Message, Message, CallType.CLIENT_STREAM> &
      grpc.ServerReadableStream<Message, Message>)
  | (ProtoCatContext<Message, Message, CallType.BIDI> &
      grpc.ServerDuplexStream<Message, Message>)

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
  {
    [M in keyof T]:
      | MethodDef2ServiceHandler<T[M]>
      | Array<MethodDef2ServiceHandler<T[M]>>
  }
>
