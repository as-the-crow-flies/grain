import {Context} from "./context.js";

class Shader
{
  public readonly handle: WebGLShader;

  constructor(ctx: Context, type: number, ...sources: string[]) {
    let gl = ctx.gl;

    let handle = gl.createShader(type);

    if (!(handle instanceof WebGLShader))
      throw new Error("Couldn't create Shader");

    this.handle = handle;

    let source = '#version 300 es\nprecision highp float;\n' + sources.join("\n");

    gl.shaderSource(this.handle, source);
    gl.compileShader(this.handle);
  }
}

export class VertexShader extends Shader
{
  constructor(ctx: Context, ...sources: string[]) {
    super(ctx, ctx.gl.VERTEX_SHADER, ...sources);
  }
}

export class FragmentShader extends Shader
{
  constructor(ctx: Context, ...sources: string[]) {
    super(ctx, ctx.gl.FRAGMENT_SHADER, ...sources);
  }
}
