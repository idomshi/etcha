<script setup lang="ts">
const viewcanvas = ref<HTMLCanvasElement>()
const viewctx = ref<CanvasRenderingContext2D>()
const buffcanvas = ref<HTMLCanvasElement>()
const buffctx = ref<CanvasRenderingContext2D>()
const width = 300
const height = 300

const imageData = ref(new ImageData(width, height))
const { modify, stroke } = useImage(imageData)

const cw = ref(0)
const ch = ref(0)
const onWindowResize = () => {
  if (viewcanvas.value === undefined) return
  cw.value = viewcanvas.value.clientWidth ?? 0
  ch.value = viewcanvas.value.clientHeight ?? 0
  viewcanvas.value.width = cw.value
  viewcanvas.value.height = ch.value
}

const left = ref(0)
const top = ref(0)
const angle = ref(Math.PI / 32)

onMounted(() => {
  if (viewcanvas.value === undefined) throw new Error('canvasを初期化できませんでした');
  viewctx.value = viewcanvas.value.getContext('2d', { desynchronized: true }) || undefined

  if (buffcanvas.value === undefined) throw new Error('canvas?')
  buffctx.value = buffcanvas.value.getContext('2d', { desynchronized: false }) || undefined

  window.addEventListener('resize', onWindowResize)
  onWindowResize()
  left.value = (cw.value - width) / 2
  top.value = (ch.value - height) / 2
})

onBeforeUnmount(() => {
  window.addEventListener('resize', onWindowResize)
})

let dragging = false
const dragstart = (e: PointerEvent) => {
  dragging = true
  const [x, y] = convert(e.offsetX, e.offsetY)
  stroke({
    x,
    y,
    pressure: e.pressure,
  })
}

const dragmove = (e: PointerEvent) => {
  if (!dragging) return
  const [x, y] = convert(e.offsetX, e.offsetY)
  stroke({
    x,
    y,
    pressure: e.pressure,
  })

}

const dragend = (e: PointerEvent) => {
  if (!dragging) return
  const [x, y] = convert(e.offsetX, e.offsetY)
  stroke({
    x,
    y,
    pressure: e.pressure,
  })
  dragging = false
}

const convert = (x: number, y: number) => {
  const iw = imageData.value.width
  const ih = imageData.value.height
  const ox = left.value + iw / 2
  const oy = top.value + ih / 2
  const c = Math.cos(angle.value)
  const s = Math.sin(angle.value)
  const dx = c * ox + s * oy - iw / 2
  const dy = -s * ox + c * oy - ih / 2
  const x0 = c * x + s * y - dx
  const y0 = -s * x + c * y - dy
  return [x0, y0]
}

const redraw = () => {
  console.log('redraw')
  const iw = imageData.value.width
  const ih = imageData.value.height
  if (buffcanvas.value === undefined) return
  if (viewcanvas.value === undefined) return
  if (viewctx.value === undefined) return
  buffcanvas.value.width = iw
  buffcanvas.value.height = ih
  buffctx.value?.putImageData(imageData.value, 0, 0)

  const w = Math.min(cw.value, iw)
  const h = Math.min(ch.value, ih)
  viewctx.value?.clearRect(0, 0, cw.value, ch.value)

  viewctx.value?.save()
  const ox = left.value + iw / 2
  const oy = top.value + ih / 2
  const c = Math.cos(angle.value)
  const s = Math.sin(angle.value)
  const dx = c * ox + s * oy - iw / 2
  const dy = -s * ox + c * oy - ih / 2
  viewctx.value?.transform(c, s, -s, c, c * dx - s * dy, s * dx + c * dy)
  viewctx.value.fillStyle = 'rgb(192, 192, 192)'
  viewctx.value?.fillRect(0, 0, iw, ih)
  viewctx.value.fillStyle = 'rgb(255, 255, 255)'
  for (let w = 0; w < iw; w += 8) {
    for (let h = 0; h < ih; h += 8) {
      if ((w & 8) === (h & 8)) continue
      viewctx.value.fillRect(w, h, Math.min(iw, w + 8) - w, Math.min(ih, h + 8) - h)
    }
  }
  viewctx.value?.drawImage(buffcanvas.value, 0, 0, w, h, 0, 0, w, h)
  viewctx.value?.restore()
}

watchEffect(redraw)

const incAngle = () => {
  angle.value += 0.01
}

const decAngle = () => {
  angle.value -= 0.01
}
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="p-2 flex flex-row gap-2 bg-slate-200">
      <button @click="modify" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">redraw</button>
      <button @click="incAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">+</button>
      <button @click="decAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">-</button>
    </div>
    <div class="h-full bg-slate-100">
      <canvas ref="viewcanvas" class="w-full h-full" @pointerdown="dragstart" @pointermove="dragmove"
        @pointerup="dragend"></canvas>
    </div>
    <canvas ref="buffcanvas" class="hidden"></canvas>
  </div>
</template>