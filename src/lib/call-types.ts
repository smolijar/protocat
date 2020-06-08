/** Call types aligned with grpc core library */
export enum CallType {
  BIDI = 'bidi',
  SERVER_STREAM = 'serverStream',
  CLIENT_STREAM = 'clientStream',
  UNARY = 'unary',
}

/** Assign call type from generated definition */
export const stubToType = (
  s: Record<'responseStream' | 'requestStream', boolean>
) =>
  s.responseStream
    ? s.requestStream
      ? CallType.BIDI
      : CallType.SERVER_STREAM
    : s.requestStream
    ? CallType.CLIENT_STREAM
    : CallType.UNARY
