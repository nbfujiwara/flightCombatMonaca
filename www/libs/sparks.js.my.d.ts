//sparks.js.d.tsがなかったから無理やり作ってみよう
//コンパイルエラー回避のためだけなので型はぐちゃぐちゃ

declare module SPARKS {
  export var REVISION: string;

    export class Emitter {
        constructor(object?:any);
        addInitializer(object:any): void;
        addAction(object:any): void;
        addCallback(event:string ,callback: (object?: any) => void): void;
        start(): void;
        stop(): void;
    }
    export class SteadyCounter {
        constructor(arg1:any);
    }
    export class Position {
        constructor(arg1:any);
    }
    export class PointZone {
        constructor(arg1:any);
    }
    export class Lifetime {
        constructor(arg1:any,arg2:any);
    }
    export class Target {
        constructor(arg1:any,arg2:any);
    }
    export class Velocity {
        constructor(arg1:any);
    }
    export class Age {
        constructor();
    }
    export class Accelerate {
        constructor(arg1:any,arg2:any,arg3:any);
    }
    export class Move {
        constructor();
    }
    export class RandomDrift {
        constructor(arg1:any,arg2:any,arg3:any);
    }

  //export var Easing: TweenEasing;
  //export var Interpolation: TweenInterpolation;
}
/*
interface TweenEasing {
  Linear: {
    None(k:number): number;
  };
  Quadratic: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Cubic: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Quartic: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Quintic: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Sinusoidal: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Exponential: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Circular: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Elastic: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Back: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
  Bounce: {
    In(k:number): number;
    Out(k:number): number;
    InOut(k:number): number;
  };
}

interface TweenInterpolation {
  Linear(v:number[], k:number): number;
  Bezier(v:number[], k:number): number;
  CatmullRom(v:number[], k:number): number;

  Utils: {
    Linear(p0:number, p1:number, t:number): number;
    Bernstein(n:number, i:number): number;
    Factorial(n): number;
  };
}

    */