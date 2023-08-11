import { UndoBuffer } from "./UndoBuffer";
import type { Layer } from "./Layers";

export interface Position {
  x: number;
  y: number;
  pressure: number
}

export interface BoundingBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const useImage = () => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const w = ref<number>()
  const h = ref<number>()
  const buffcanvas = ref<OffscreenCanvas>()
  const buffctx = ref<OffscreenCanvasRenderingContext2D>()
  let layers: Layer
  let pixel: Uint8ClampedArray
  let imageData: ImageData
  let undoBuffer: UndoBuffer<ImageData>

  const init = (width: number, height: number) => {
    w.value = width
    h.value = height
    buffcanvas.value = new OffscreenCanvas(width, height)
    buffctx.value = buffcanvas.value.getContext("2d") ?? undefined
    layers = new ImageFolder(width, height)

    const baseLayer = new ColorImage(width, height)
    baseLayer.image.fill(255)
    layers.add(baseLayer)
    layers.add(new ColorImage(width, height))
    pixel = layers.image
    imageData = new ImageData(pixel, width)
    undoBuffer = new UndoBuffer<ImageData>(
      new ImageData(new Uint8ClampedArray(pixel), width)
    );
  }

  const modify = () => {
    if (w.value === undefined || h.value === undefined) return
    const b = Math.floor(Math.random() * 256)
    for (let y = 0; y < h.value; y++) {
      for (let x = 0; x < w.value; x++) {
        const idx = (y * w.value + x) * 4
        pixel[idx] = x * 255 / w.value
        pixel[idx + 1] = y * 255 / h.value
        pixel[idx + 2] = b
        pixel[idx + 3] = 255
      }
    }
    imageData = new ImageData(pixel, w.value, h.value)
  }

  const stroke = (pos: Position): void => {
    if (w.value === undefined || h.value === undefined) return
    layers.stroke(pos)
    imageData = new ImageData(layers.image, w.value, h.value)
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
    init,
    modify,
    stroke,
    undo,
    redo,
  }
}
