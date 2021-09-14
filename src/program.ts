import {Context} from "./context.js";
import {VertexShader, FragmentShader} from "./shader.js";

export class Program
{
  public readonly handle: WebGLProgram;

  constructor(ctx: Context, vs: VertexShader, fs: FragmentShader) {
    let gl = ctx.gl;

    let handle = gl.createProgram();

    if (!(handle instanceof WebGLProgram))
      throw new Error("Error while creating WebGL Program");

    this.handle = handle;

    gl.attachShader(this.handle, vs.handle);
    gl.attachShader(this.handle, fs.handle);
    gl.linkProgram(this.handle);

    if (!gl.getProgramParameter(this.handle, gl.LINK_STATUS))
    {
      const displayError = (error: string, source: string) =>
      {
        let errorLine = parseInt(error.match(/ERROR: \d+:(\d+)/)![1]);

        let src = source
            .split("\n")
            .map((line, index) => `${index+1 === errorLine ? '>>>' : index+1}\t ${line}`)
            .slice(errorLine-5, errorLine+5)
            .join("\n")

        throw new Error(`\n${error}\n${src}\n`);
      }

      const [perr, verr, ferr] = [gl.getProgramInfoLog(this.handle), gl.getShaderInfoLog(vs.handle), gl.getShaderInfoLog(fs.handle)]

      if (perr) console.error(perr)
      if (verr) displayError(verr, gl.getShaderSource(vs.handle)!)
      if (ferr) displayError(ferr, gl.getShaderSource(fs.handle)!)
    }
  }
}