declare module THREE {
    export class EffectComposer {
        constructor(arg1:any);
        addPass(arg1:any): void;
        reset(): void;
        render(arg1:any): void;
    }
    export class RenderPass {
        constructor(arg1:any,arg2:any);
    }

    export class ShaderPass {
        uniforms: any;
        renderToScreen:any;
        constructor(arg1:any);
    }

    export var HorizontalBlurShader;
    export var VerticalBlurShader;

}

