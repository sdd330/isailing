export class Random {
  static num(upper: number): number {
    return Math.floor(Math.random() * upper)
  }

  static range(min: number, max: number): number {
    return min + this.num(max - min + 1)
  }
}

