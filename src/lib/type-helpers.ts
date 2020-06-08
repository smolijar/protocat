// List object keys without index signatures
// KnownKeys<{ [index: string]: string; foo: string }> = 'foo'
type KnownKeys<T> = {
  [K in keyof T]: string extends K ? never : number extends K ? never : K
} extends { [_ in keyof T]: infer U }
  ? U
  : never

// Remove index signature keys from object
// RemoveIdxSgn<{ [index: string]: string; foo: string }> = { foo: string }
export type RemoveIdxSgn<T> = Pick<T, KnownKeys<T>>
