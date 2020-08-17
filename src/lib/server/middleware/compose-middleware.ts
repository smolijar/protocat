import { Middleware } from '../call'

export const composeMiddleware = (middleware: Middleware[]): Middleware => {
  return async (call, next) => {
    const dispatch = async (i: number): Promise<void> => {
      // TODO: Maybe throw / log on repeated next
      const fn = i === middleware.length ? next : middleware[i]
      if (!fn) {
        return
      }
      let nextCalled = false
      await fn(call, () => {
        nextCalled = true
        return dispatch(i + 1)
      })
      // Dispatch should be called if there is still another middleware
      if (!nextCalled && i !== middleware.length) {
        return dispatch(i + 1)
      }
    }
    await dispatch(0)
  }
}
