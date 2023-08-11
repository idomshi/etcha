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
    stroke,
    undo,
    redo,
  }
}
