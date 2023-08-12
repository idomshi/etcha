<script setup lang="ts">
import useViewPosition from '~/composables/imagePos';

const { buffcanvas, width, height } = useImage()
const { posArray, setCenter } = useViewPosition()

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

const c = computed(() => Math.cos(posArray.value.angle))
const s = computed(() => Math.sin(posArray.value.angle))
// width, heightがundefinedのとき、dx, dyを本当に0にしていいのかをちゃんと検討していない。
const dx = computed(() =>
  width.value === undefined
    ? 0
    : c.value * posArray.value.center.x
    + s.value * posArray.value.center.y
    - width.value * posArray.value.scale / 2
)
const dy = computed(() =>
  height.value === undefined
    ? 0
    : -s.value * posArray.value.center.x
    + c.value * posArray.value.center.y
    - height.value * posArray.value.scale / 2
)

const redraw = () => {
  if (buffcanvas.value === undefined) return
  const iw = width.value ?? 0
  const ih = height.value ?? 0
  if (viewcanvas.value === undefined) return
  if (viewctx.value === undefined) return

  viewctx.value.fillStyle = 'rgb(192, 192, 192)'
  viewctx.value.fillRect(0, 0, cw.value, ch.value)

  viewctx.value?.save()

  // マウス座標の変換行列の逆行列。
  // [c / sc -s / sc c * dx - s * dy]   [1 0 c * dx - s * dy]   [c -s 0]   [sc  0 0]
  // [s / sc  c / sc s * dx + c * dy] = [0 1 s * dx + c * dy] * [s  c 0] * [ 0 sc 0]
  // [     0       0               1]   [0 0               1]   [0  0 1]   [ 0  0 1]
  // 変換行列を全部掛け合わせてからtransformするときは、全て元座標系に対する単位で指定する。
  viewctx.value?.transform(
    c.value * posArray.value.scale,
    s.value * posArray.value.scale,
    -s.value * posArray.value.scale,
    c.value * posArray.value.scale,
    c.value * dx.value - s.value * dy.value,
    s.value * dx.value + c.value * dy.value
  )
  // 順番にtransformするときは、変換後の座標系に対して次の変形が適用される。
  // ex.: scaleの後に（元座標系で）translate(dx, dy)したいときはtranslate(dx / sc, dy / sc)としなければならない。
  // viewctx.value?.transform(scale.value, 0, 0, scale.value, 0, 0)
  // viewctx.value?.transform(c, s, -s, c, 0, 0)
  // viewctx.value?.transform(1, 0, 0, 1, dx / scale.value, dy / scale.value)
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