import { debounce } from './utils.js';

export class Context
{
  public gl: WebGL2RenderingContext;

  public get width() { return this.gl.canvas.width; }
  public get height() { return this.gl.canvas.height; }

  constructor(canvas: HTMLCanvasElement) {
    let gl = canvas.getContext("webgl2", { antialias: false });

    if (!(gl instanceof WebGL2RenderingContext))
      throw new Error("WebGL2 not supported for canvas");

    this.gl = gl;

    gl.getExtension("EXT_color_buffer_float");  // Needed to support RGBA32F Framebuffer Textures

    let resize = () => {
      this.gl.canvas.width = this.gl.canvas.clientWidth;
      this.gl.canvas.height = this.gl.canvas.clientHeight;
    }

    let resizeDebounce = debounce(resize);

    resize();
    window.addEventListener("resize", resizeDebounce);
  }

  public run = (func: Function) =>
  {
    const frame = () => {
      func();
      window.requestAnimationFrame(frame);
    }

    frame();
  }
}
