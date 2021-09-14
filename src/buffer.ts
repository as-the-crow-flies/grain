import { Context } from "./context.js";

export enum BufferFormat { R, RG, RGB, RGBA}
export enum BufferType { Byte, Float}

export class Buffer
{
  private readonly pingHandle: WebGLTexture;
  private readonly pingFramebuffer: WebGLFramebuffer;

  private readonly pongHandle: WebGLTexture;
  private readonly pongFramebuffer: WebGLFramebuffer;

  public ping: boolean = true;

  public get handle() { return this.ping ? this.pingHandle : this.pongHandle; }
  public get framebuffer() { return this.ping ? this.pongFramebuffer : this.pingFramebuffer; }

  public readonly width: number;
  public readonly height: number;
  public readonly type: string;
  public readonly format: string;

  constructor(ctx: Context, width: number, height: number = width,
              type: BufferType = BufferType.Float,
              format: BufferFormat = BufferFormat.RGBA,
              data: any = null) {

    let gl = ctx.gl;

    this.width = width;
    this.height = height;
    this.type = BufferType[type];
    this.format = BufferFormat[format];

    this.pingHandle = gl.createTexture()!;
    this.pingFramebuffer = gl.createFramebuffer()!;

    this.pongHandle = gl.createTexture()!;
    this.pongFramebuffer = gl.createFramebuffer()!;

    for (let ping of [true, false])
    {
      // Set Texture Parameters
      gl.bindTexture(gl.TEXTURE_2D, ping ? this.pingHandle : this.pongHandle);
      gl.texImage2D(gl.TEXTURE_2D, 0, Buffer.getInternalFormat(gl, format, type), width, height,
          0, Buffer.getFormat(gl, format), Buffer.getType(gl, type), ping ? data : null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      // Create Framebuffer
      gl.bindFramebuffer(gl.FRAMEBUFFER, ping ? this.pingFramebuffer : this.pongFramebuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D,
          ping ? this.pingHandle : this.pongHandle, 0);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  private static getInternalFormat(gl: WebGL2RenderingContext, format: BufferFormat, type: BufferType)
  {
    switch (type) {
      case BufferType.Byte:
        switch (format) {
          case BufferFormat.R: return gl.R8;
          case BufferFormat.RG: return gl.RG8;
          case BufferFormat.RGB: return gl.RGB8;
          case BufferFormat.RGBA: return gl.RGBA8;
        }
      case BufferType.Float:
        switch (format) {
          case BufferFormat.R: return gl.R32F;
          case BufferFormat.RG: return gl.RG32F;
          case BufferFormat.RGB: return gl.RGB32F;
          case BufferFormat.RGBA: return gl.RGBA32F;
        }
    }
  }

  private static getFormat(gl: WebGL2RenderingContext, format: BufferFormat)
  {
    switch (format) {
      case BufferFormat.R: return gl.RED;
      case BufferFormat.RG: return gl.RG;
      case BufferFormat.RGB: return gl.RGB;
      case BufferFormat.RGBA: return gl.RGBA;
    }
  }

  private static getType(gl: WebGL2RenderingContext, type: BufferType)
  {
    switch (type)
    {
      case BufferType.Byte: return gl.UNSIGNED_BYTE;
      case BufferType.Float: return gl.FLOAT;
    }
  }
}