import { UndoBuffer } from "./UndoBuffer";

interface Position {
  x: number;
  y: number;
  pressure: number
}

type Layer =
  | ColorImage

class ColorImage {
  private name: string;
  private pixels: Uint8ClampedArray;
  private w: number;
  private h: number;
  private cache: Uint8ClampedArray;

  public constructor (width: number, height: number) {
    this.name = "image" + Math.floor(Math.random() * 10);
    this.w = width;
    this.h = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
    this.cache = new Uint8ClampedArray(width * height * 4);
  }

  public get image() : Uint8ClampedArray {
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

  public stroke(pos: Position): void {
    if (this.isDrawing) {
      if (pos.pressure === 0) {
        this.isDrawing = false

        // undoバッファに突っ込む。
        // undoBuffer.push(new ImageData(new Uint8ClampedArray(pixel), width));
      }
      this.line(this.previousePos, pos)
      this.previousePos = pos
    } else {
      this.isDrawing = true
      this.previousePos = pos
      this.plot(Math.round(pos.x), Math.round(pos.y))
    }
    this.cache.set(this.pixels)
  }
}

export const useImage = (width: number, height: number) => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const w = ref(width)
  const h = ref(height)
  const buffcanvas = ref(new OffscreenCanvas(width, height))
  const buffctx = ref(buffcanvas.value.getContext("2d"))
  const layers = new ColorImage(width, height)
  const pixel = layers.image
  let imageData = new ImageData(pixel, width)
  const undoBuffer = new UndoBuffer<ImageData>(
    new ImageData(new Uint8ClampedArray(pixel), width)
  );

  const modify = () => {
    const b = Math.floor(Math.random() * 256)
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4
        pixel[idx] = x * 255 / width
        pixel[idx + 1] = y * 255 / height
        pixel[idx + 2] = b
        pixel[idx + 3] = 255
      }
    }
    imageData = new ImageData(pixel, width)
  }

  const stroke = (pos: Position): void => {
    layers.stroke(pos)
    imageData = new ImageData(layers.image, width)
  }

  function undo() {
    const image = undoBuffer.undo()
    if (image === undefined) return
    imageData.data.set(image.data)
  }

  function redo() {
    const image = undoBuffer.redo()
    if (image === undefined) return
    imageData.data.set(image.data)
  }

  const redraw = () => {
    buffctx.value?.putImageData(imageData, 0, 0)

    requestAnimationFrame(redraw)
  }

  redraw()

  return {
    buffcanvas: readonly(buffcanvas),
    width: readonly(w),
    height: readonly(h),
    modify,
    stroke,
    undo,
    redo,
  }
}
