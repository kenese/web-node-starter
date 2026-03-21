export class Thing {
  world;

  constructor(suffix = 'world') {
    this.world = suffix;
  }

  hello() {
    return `hello ${this.world}`;
  }
}
