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

  private readonly _locations: Record<number, WebGLUniformLocation>;

  constructor(ctx: Context, inputs: Record<string, Buffer>, output: Buffer | null, func: string) {
    this._ctx = ctx;
    this._inputs = inputs;
    this._output = output;

    let declarations = Object.entries(inputs).map(([name, _]) => `
      uniform sampler2D _${name};
      vec4 ${name}(vec2 uv) {         
        if (uv.x < 0. || uv.x > 1. || uv.y < 0. || uv.y > 1.) return vec4(0);
        return texture(_${name}, uv);
      }
      vec4 ${name}(ivec2 xy) { return texelFetch(_${name}, xy, 0); }
    `);

    this._program = new Program(ctx, new VertexShader(ctx, QUAD), new FragmentShader(ctx, `
      layout (location = 0) out vec4 result;      
      uniform vec2 _scale;
      uniform vec2 _iscale;
      ivec2 XY() { return ivec2(gl_FragCoord.xy); }
      vec2 UV() { return _iscale * gl_FragCoord.xy; } 
      vec2 SquareUV()
      {
          return _iscale.x > _iscale.y
            ? _iscale.x * (gl_FragCoord.xy - .5 * vec2(0, _scale.y - _scale.x))
            : _iscale.y * (gl_FragCoord.xy - .5 * vec2(_scale.x - _scale.y, 0));
      }
      ${declarations.join("\n")}
      ${func}
    `));


    this._locations = Object.entries(inputs).reduce((x, [name, _]) =>
        ({...x, [name]: this._ctx.gl.getUniformLocation(this._program.handle, `_${name}`)}), {})

    this.addLocation("_iscale");
    this.addLocation("_scale");
  }

  render()
  {
    let gl = this._ctx.gl;

    let width = this._output?.width ?? this._ctx.width;
    let height = this._output?.height ?? this._ctx.height;

    gl.viewport(0, 0, width, height);
    gl.useProgram(this._program.handle);

    let index = 0;
    for (let [name, texture] of Object.entries(this._inputs))
    {
      gl.activeTexture(gl.TEXTURE0 + index)
      gl.bindTexture(gl.TEXTURE_2D, texture.handle);
      gl.uniform1i(this._locations[name], index);

      index++;
    }

    gl.uniform2f(this._locations["_scale"], width, height);
    gl.uniform2f(this._locations["_iscale"], 1/width, 1/height);

    gl.bindFramebuffer(gl.FRAMEBUFFER, this._output?.framebuffer ?? null);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    if (this._output) this._output.ping = !this._output.ping;
  }

  private addLocation(name: string) {
    this._ctx.gl.useProgram(this._program.handle);
    this._locations[name] = this._ctx.gl.getUniformLocation(this._program.handle, name);
  }
}