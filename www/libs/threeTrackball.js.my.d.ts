//sparks.js.d.tsがなかったから無理やり作ってみよう
//コンパイルエラー回避のためだけなので型はぐちゃぐちゃ

declare module THREE {
    export class TrackballControls {
        constructor(arg1:any,arg2?:any);
        update(): void;
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