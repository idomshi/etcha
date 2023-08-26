import { UndoBuffer } from "./UndoBuffer";
import type { Layer } from "./Layers";
import init, { Layer as WasmLayer } from '@/assets/wasm/wasm'

let memory: WebAssembly.Memory;
memory = (await init()).memory
console.log(memory)

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

let layers: Layer
let pixel: Uint8ClampedArray
let imageData: ImageData
let undoBuffer: UndoBuffer<ImageData>
let requestId = 0

let layer: WasmLayer
function newlayer() {
  const width = 8
  const height = 16
  layer = WasmLayer.new(width, height)
  const pixelsPtr = layer.get_pixels()
  const pixels = new Uint8ClampedArray(memory.buffer, pixelsPtr, width * height * 4);
  console.log(pixels)
}
export const useImage = () => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const w = useState("w", () => 0)
  const h = useState("h", () => 0)
  const buffcanvas = useState<OffscreenCanvas | undefined>("buffcanvas")
  const buffctx = useState<OffscreenCanvasRenderingContext2D | undefined>("buffctx")

  const initImage = (width: number, height: number) => {
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
    // const image = undoBuffer.undo()
    // if (image === undefined) return
    // imageData.data.set(image.data)
    newlayer()
  }

  function redo() {
    const image = undoBuffer.redo()
    if (image === undefined) return
    imageData.data.set(image.data)
  }

  const redraw = () => {
    buffctx.value?.putImageData(imageData, 0, 0)

    requestId = requestAnimationFrame(redraw)
  }

  if (requestId === 0) {
    redraw()
  }

  return {
    buffcanvas: readonly(buffcanvas),
    width: readonly(w),
    height: readonly(h),
    init: initImage,
    stroke,
    undo,
    redo,
  }
}
