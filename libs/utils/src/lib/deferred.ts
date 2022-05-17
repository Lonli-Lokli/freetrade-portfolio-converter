export class Deferred<D, E = any> {
    promise: Promise<D>;
    resolve!: (value: D | PromiseLike<D>) => void;
    reject!: (reason?: E) => void;
  
    constructor() {
      this.promise = new Promise<D>((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
    }
  }
  