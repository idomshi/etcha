import { UndoBuffer } from "./UndoBuffer";
import { usePenState } from "./usePenState";
import init, { Layer as WasmLayer } from '@/assets/wasm/wasm'

let memory: WebAssembly.Memory;
memory = (await init()).memory

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

let layers: WasmLayer
let pixel: Uint8ClampedArray
let imageData: ImageData
let undoBuffer: UndoBuffer<ImageData>
let requestId = 0

export const useImage = () => {
  const { erase } = usePenState()
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
    layers = WasmLayer.new(width, height)

    const pixelsPtr = layers.pixels()
    pixel = new Uint8ClampedArray(memory.buffer, pixelsPtr, width * height * 4);
    imageData = new ImageData(pixel, width, height)
    // undoBuffer = new UndoBuffer<ImageData>(
    //   new ImageData(new Uint8ClampedArray(pixel), width)
    // );
  }

  const stroke = (pos: Position): void => {
    if (w.value === undefined || h.value === undefined) return
    layers.stroke(pos.x, pos.y, pos.pressure, erase.value)
  }

  async function undo() {
    // const image = undoBuffer.undo()
    // if (image === undefined) return
    // imageData.data.set(image.data)
  }

  function redo() {
    const image = undoBuffer.redo()
    if (image === undefined) return
    imageData.data.set(image.data)
  }

  const redraw = () => {
    if (layers === undefined) return
    if (pixel === undefined) return
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
