import type { BoundingBox, Position } from "./useImage";

export class ColorImage {
  private name: string;
  private pixels: Uint8ClampedArray;
  private w: number;
  private h: number;
  private cache: Uint8ClampedArray;

  public constructor(width: number, height: number) {
    this.name = "image" + Math.floor(Math.random() * 10);
    this.w = width;
    this.h = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.cache = new Uint8ClampedArray(width * height * 4);
  }

  public get image(): Uint8ClampedArray {
    return this.cache
  }

  private isDrawing = false
  private previousePos: Position = { x: 0, y: 0, pressure: 0 }

  private plot(x: number, y: number): void {
    const idx = (y * this.w + x) * 4
    this.pixels[idx] = this.pixels[idx + 1] = this.pixels[idx + 2] = 0
    this.pixels[idx + 3] = 255
  }

  private line(pos1: Position, pos2: Position): void {
    const x0 = Math.round(pos1.x)
    const y0 = Math.round(pos1.y)
    const x1 = Math.round(pos2.x)
    const y1 = Math.round(pos2.y)
    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)
    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1
    let err = dx - dy

    let x = x0
    let y = y0
    while (true) {
      this.plot(x, y)
      if (x === x1 && y === y1) break
      const e2 = 2 * err
      if (e2 > -dy) {
        err -= dy
        x += sx
      }
      if (e2 < dx) {
        err += dx
        y += sy
      }
    }
  }

  public stroke(pos: Position): BoundingBox {
    let result: BoundingBox = { left: 0, top: 0, width: 0, height: 0 }
    if (this.isDrawing) {
      if (pos.pressure === 0) {
        this.isDrawing = false

        // undoバッファに突っ込む。
        // undoBuffer.push(new ImageData(new Uint8ClampedArray(pixel), width));
      }
      this.line(this.previousePos, pos)
      result = {
        left: Math.floor(Math.min(pos.x, this.previousePos.x)),
        top: Math.floor(Math.min(pos.y, this.previousePos.y)),
        width: Math.ceil(Math.abs(this.previousePos.x - pos.x)) + 2,
        height: Math.ceil(Math.abs(this.previousePos.y - pos.y)) + 2,
      }
      this.previousePos = pos
    } else {
      this.isDrawing = true
      result = {
        left: Math.floor(pos.x),
        top: Math.floor(pos.y),
        width: 1,
        height: 1,
      }
      this.previousePos = pos
      this.plot(Math.round(pos.x), Math.round(pos.y))
    }
    this.cache.set(this.pixels)
    return result
  }
}
