declare module 'duration-time-conversion' {
  const DT: {
    t2d: (time: string) => number
    d2t: (duration: number) => string
  }
  export default DT
}
