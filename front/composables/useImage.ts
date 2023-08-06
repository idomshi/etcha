import { UndoBuffer } from "./UndoBuffer";
import type { Layer } from "./Layers";

export interface Position {
  x: number;
  y: number;
  pressure: number
}

export const useImage = (width: number, height: number) => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const w = ref(width)
  const h = ref(height)
  const buffcanvas = ref(new OffscreenCanvas(width, height))
  const buffctx = ref(buffcanvas.value.getContext("2d"))
  const layers: Layer = new ColorImage(width, height)
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
