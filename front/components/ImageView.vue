<script setup lang="ts">
const viewcanvas = ref<HTMLCanvasElement>()
const viewctx = ref<CanvasRenderingContext2D>()
const buffcanvas = ref<HTMLCanvasElement>()
const buffctx = ref<CanvasRenderingContext2D>()
const width = 300
const height = 300

const imageData = ref(new ImageData(width, height))
const { modify, stroke } = useImage(imageData)

onMounted(() => {
  if (viewcanvas.value === undefined) throw new Error('canvasを初期化できませんでした');
  viewctx.value = viewcanvas.value.getContext('2d', { desynchronized: true }) || undefined

  if (buffcanvas.value === undefined) throw new Error('canvas?')
  buffctx.value = buffcanvas.value.getContext('2d', { desynchronized: false }) || undefined
})

let dragging = false
const dragstart = (e: PointerEvent) => {
  dragging = true
  stroke({
    x: e.offsetX,
    y: e.offsetY,
    pressure: e.pressure,
  })
}

const dragmove = (e: PointerEvent) => {
  if (!dragging) return
  stroke({
    x: e.offsetX,
    y: e.offsetY,
    pressure: e.pressure,
  })

}

const dragend = (e: PointerEvent) => {
  if (!dragging) return
  stroke({
    x: e.offsetX,
    y: e.offsetY,
    pressure: e.pressure,
  })
  dragging = false
}

const redraw = () => {
  console.log('redraw')
  const iw = imageData.value.width
  const ih = imageData.value.height
  if (buffcanvas.value === undefined) return
  if (viewcanvas.value === undefined) return
  buffcanvas.value.width = iw
  buffcanvas.value.height = ih
  buffctx.value?.putImageData(imageData.value, 0, 0)

  const cw = viewcanvas.value.clientWidth
  const ch = viewcanvas.value.clientHeight
  const w = Math.min(cw, iw)
  const h = Math.min(ch, ih)
  viewcanvas.value.width = cw
  viewcanvas.value.height = ch
  viewctx.value?.clearRect(0, 0, cw, ch)
  viewctx.value?.drawImage(buffcanvas.value, 0, 0, w, h, 0, 0, w, h)
}

watchEffect(redraw)
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="p-2 flex flex-row gap-2 bg-slate-200">
      <button @click="modify" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">redraw</button>
    </div>
    <div class="h-full bg-slate-100">
      <canvas ref="viewcanvas" class="w-full h-full" @pointerdown="dragstart" @pointermove="dragmove"
        @pointerup="dragend"></canvas>
    </div>
    <canvas ref="buffcanvas" class="hidden"></canvas>
  </div>
</template>