import { UndoBuffer } from "./UndoBuffer";

export const useImage = (width: number, height: number) => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const w = ref(width)
  const h = ref(height)
  const pixel = new Uint8ClampedArray(width * height * 4)
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

  interface Position {
    x: number;
    y: number;
    pressure: number
  }

  let isDrawing = false
  let previousePos: Position = { x: 0, y: 0, pressure: 0 }

  const plot = (x: number, y: number): void => {
    const idx = (y * width + x) * 4
    pixel[idx] = pixel[idx + 1] = pixel[idx + 2] = 0
    pixel[idx + 3] = 255
  }

  const line = (pos1: Position, pos2: Position): void => {
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
      plot(x, y)
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

  const stroke = (pos: Position): void => {
    if (isDrawing) {
      if (pos.pressure === 0) {
        isDrawing = false

        // undoバッファに突っ込む。
        undoBuffer.push(new ImageData(new Uint8ClampedArray(pixel), width));
      }
      line(previousePos, pos)
      previousePos = pos
    } else {
      isDrawing = true
      previousePos = pos
      plot(Math.round(pos.x), Math.round(pos.y))
    }
    imageData = new ImageData(pixel, width)
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

  return {
    imageData,
    width: readonly(w),
    height: readonly(h),
    modify,
    stroke,
    undo,
    redo,
  }
}
