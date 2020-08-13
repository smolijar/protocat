import * as grpc from '@grpc/grpc-js'
import { RemoveIdxSgn, TypedOnData } from './type-helpers'
import { CallType } from './call-types'
import { Message } from 'google-protobuf'

/** ProtoCat call */
export type ProtoCatCall<
  Extension = {},
  Req = Message,
  Res = Message,
  Type extends CallType = CallType
> = {
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
} & Extension &
  (Type extends CallType.UNARY
    ? grpc.ServerUnaryCall<Req, Res> & {
        response: Res
      }
    : {}) &
  (Type extends CallType.CLIENT_STREAM
    ? TypedOnData<grpc.ServerReadableStream<Req, Res>, Req> & {
        response: Res
      }
    : {}) &
  (Type extends CallType.SERVER_STREAM
    ? grpc.ServerWritableStream<Req, Res>
    : {}) &
  (Type extends CallType.BIDI
    ? TypedOnData<grpc.ServerDuplexStream<Req, Res>, Req>
    : {})

export type NextFn = () => Promise<void>

export type ProtoCatAnyCall<Extension = {}> =
  | ProtoCatCall<Extension, Message, Message, CallType.UNARY>
  | ProtoCatCall<Extension, Message, Message, CallType.SERVER_STREAM>
  | ProtoCatCall<Extension, Message, Message, CallType.CLIENT_STREAM>
  | ProtoCatCall<Extension, Message, Message, CallType.BIDI>

export type Middleware<Extension = {}> = (
  call: ProtoCatAnyCall<Extension>,
  next: NextFn
) => any

type MethodDef2CallType<
  M extends grpc.MethodDefinition<any, any>
> = M['requestStream'] extends true
  ? M['responseStream'] extends true
    ? CallType.BIDI
    : CallType.CLIENT_STREAM
  : M['responseStream'] extends true
  ? CallType.SERVER_STREAM
  : CallType.UNARY

/** Convert a single method definition to service handler type */
type MethodDef2ServiceHandler<
  H,
  Extension = {}
> = H extends grpc.MethodDefinition<infer Req, infer Res>
  ? (
      call: ProtoCatCall<Extension, Req, Res, MethodDef2CallType<H>>,
      next: NextFn
    ) => any
  : never

/** Create service handler type for whole client definition */
export type ServiceImplementation<T, Extension = {}> = RemoveIdxSgn<
  {
    [M in keyof T]:
      | MethodDef2ServiceHandler<T[M], Extension>
      | Array<MethodDef2ServiceHandler<T[M], Extension>>
  }
>