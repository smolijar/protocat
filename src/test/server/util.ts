

export const testAddress = () => {
  const ADDR = '0.0.0.0:0'
  let port = 0
  return {
    setPort: (p: number) => { port = p },
    getAddress: () => ADDR.replace(':0', `:${port ?? 0}`)
  }
}

