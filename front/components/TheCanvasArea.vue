<script setup lang="ts">
import useViewPosition from '~/composables/imagePos';

const { buffcanvas, width, height } = useImage()
const { posArray, setCenter } = useViewPosition()
const { t1, t2, t3, t4, t5, t6 } = useTransform()

const viewcanvas = ref<HTMLCanvasElement>()
const viewctx = ref<CanvasRenderingContext2D>()
const cw = ref(0)
const ch = ref(0)

const onWindowResize = () => {
  if (viewcanvas.value === undefined) return
  cw.value = viewcanvas.value.clientWidth ?? 0
  ch.value = viewcanvas.value.clientHeight ?? 0
  viewcanvas.value.width = cw.value
  viewcanvas.value.height = ch.value
}

onMounted(() => {
  if (viewcanvas.value === undefined) throw new Error('canvasを初期化できませんでした');
  viewctx.value = viewcanvas.value.getContext('2d', { desynchronized: true }) || undefined

  window.addEventListener('resize', onWindowResize)
  onWindowResize()
  setCenter(cw.value / 2, ch.value / 2)

  redraw()
})

onUnmounted(() => {
  window.addEventListener('resize', onWindowResize)
})

const redraw = () => {
  if (buffcanvas.value === undefined) return
  const iw = width.value ?? 0
  const ih = height.value ?? 0
  if (viewcanvas.value === undefined) return
  if (viewctx.value === undefined) return

  viewctx.value.fillStyle = 'rgb(192, 192, 192)'
  viewctx.value.fillRect(0, 0, cw.value, ch.value)

  viewctx.value?.save()

  viewctx.value?.transform(t1.value, t2.value, t3.value, t4.value, t5.value, t6.value)
  viewctx.value.clearRect(0, 0, iw, ih)
  if (posArray.value.scale > 1) viewctx.value.imageSmoothingEnabled = false;
  viewctx.value.imageSmoothingQuality
  viewctx.value?.drawImage(buffcanvas.value, 0, 0, iw, ih, 0, 0, iw, ih)
  viewctx.value?.restore()

  requestAnimationFrame(redraw)
}
</script>

<template>
  <div class="h-full touch-none">
    <canvas ref="viewcanvas" class="w-full h-full bg-check"></canvas>
  </div>
</template>

<style scoped>
.bg-check {
  background-image:
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%),
    linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%);
  background-position: 0 0, 8px 8px;
  background-size: 16px 16px;
  background-color: rgb(192, 192, 192);
}
</style>
