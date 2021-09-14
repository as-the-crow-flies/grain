import {Context} from "./context.js";
import {Buffer} from "./buffer.js";
import {Program} from "./program.js";
import {FragmentShader, VertexShader} from "./shader.js";
import {QUAD} from "./shaders.js";

export class Function
{
  private readonly _ctx: Context;
  private readonly _inputs : Record<string, Buffer>;
  private readonly _output: Buffer | null;

  private readonly _program: Program;

  private readonly _inputLocations: Record<number, WebGLUniformLocation>;

  constructor(ctx: Context, inputs: Record<string, Buffer>, output: Buffer | null, func: string) {
    this._ctx = ctx;
    this._inputs = inputs;
    this._output = output;

    let declarations = Object.entries(inputs).map(([name, _]) => `
      uniform sampler2D _${name};
      vec4 ${name}() { return texelFetch(_${name}, ivec2(gl_FragCoord), 0); }
      vec4 ${name}(int x, int y) { return texelFetch(_${name}, ivec2(gl_FragCoord) + ivec2(x, y), 0); }
    `);

    this._program = new Program(ctx, new VertexShader(ctx, QUAD), new FragmentShader(ctx, `
      layout (location = 0) out vec4 result;
      ${declarations.join("\n")}
      ${func}
    `));

    this._inputLocations = Object.entries(inputs).reduce((x, [name, _]) =>
        ({...x, [name]: this._ctx.gl.getUniformLocation(this._program.handle, `_${name}`)}), {})
  }

  render()
  {
    let gl = this._ctx.gl;

    gl.viewport(0, 0, this._output?.width ?? this._ctx.width, this._output?.height ?? this._ctx.height);
    gl.useProgram(this._program.handle);

    let index = 0;
    for (let [name, texture] of Object.entries(this._inputs))
    {
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, texture.handle);
      gl.uniform1i(this._inputLocations[name], index);

      index++;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._output?.framebuffer ?? null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (this._output) this._output.ping = !this._output.ping;
  }
}