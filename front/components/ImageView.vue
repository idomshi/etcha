<script setup lang="ts">
import useViewPosition from '~/composables/imagePos';

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

const { posArray, setCenter, setAngle, zoomIn, zoomOut } = useViewPosition()

onMounted(() => {
  if (viewcanvas.value === undefined) throw new Error('canvasを初期化できませんでした');
  viewctx.value = viewcanvas.value.getContext('2d', { desynchronized: true }) || undefined

  if (buffcanvas.value === undefined) throw new Error('canvas?')
  buffctx.value = buffcanvas.value.getContext('2d', { desynchronized: false }) || undefined

  window.addEventListener('resize', onWindowResize)
  onWindowResize()
  setCenter(cw.value / 2, ch.value / 2)
})

onBeforeUnmount(() => {
  window.addEventListener('resize', onWindowResize)
})

let dragging = false
let panning = { panning: false, x: 0, y: 0 }
const dragstart = (e: PointerEvent) => {
  switch (e.buttons) {
    case 1:
      dragging = true
      const [x, y] = convert(e.offsetX, e.offsetY)
      stroke({
        x,
        y,
        pressure: e.pressure,
      })
      break
    case 4:
      panning = {
        panning: true,
        x: e.offsetX,
        y: e.offsetY,
      }
      break;
  }
}

const dragmove = (e: PointerEvent) => {
  switch (e.buttons) {
    case 1:
      if (!dragging) return
      const [x, y] = convert(e.offsetX, e.offsetY)
      stroke({
        x,
        y,
        pressure: e.pressure,
      })
      break
    case 4:
      if (!panning.panning) return
      setCenter(posArray.value.center.x + e.offsetX - panning.x, posArray.value.center.y + e.offsetY - panning.y)
      panning.x = e.offsetX
      panning.y = e.offsetY
      break
  }
}

const dragend = (e: PointerEvent) => {
  if (dragging) {
    const [x, y] = convert(e.offsetX, e.offsetY)
    stroke({
      x,
      y,
      pressure: e.pressure,
    })
    dragging = false
  }
  if (panning.panning) {
    panning.panning = false
  }

}

const convert = (x: number, y: number) => {
  /** transformの2*3行列と同じ形の行列を入力として、affine変換行列の掛け算を行う。 */
  function mul(m0: number[], m1: number[]) {
    // m0[0] = a
    // m0[1] = b
    // m0[2] = c
    // m0[3] = d
    // m0[4] = e
    // m0[5] = f

    // m1[0] = g
    // m1[1] = h
    // m1[2] = i
    // m1[3] = j
    // m1[4] = k
    // m1[5] = l

    // r[0] = a * g + c * h 
    // r[1] = b * g + d * h
    // r[2] = a * i + c * j 
    // r[3] = b * i + d * j
    // r[4] = a * k + c * l + e
    // r[5] = b * k + d * l + f 
    return [
      m0[0] * m1[0] + m0[2] * m1[1],
      m0[1] * m1[0] + m0[3] * m1[1],
      m0[0] * m1[2] + m0[2] * m1[3],
      m0[1] * m1[2] + m0[3] * m1[3],
      m0[0] * m1[4] + m0[2] * m1[5] + m0[4],
      m0[1] * m1[4] + m0[3] * m1[5] + m0[5],
    ]
  }
  const iw = imageData.value.width
  const ih = imageData.value.height
  const c = Math.cos(posArray.value.angle)
  const s = Math.sin(posArray.value.angle)

  // 全てわかった。(dx, dy)の単位がスケーリングの前なのか後なのかがごっちゃになってるんだ。
  // const d = mul(
  //   [1 / scale.value, 0, 0, 1 / scale.value, 0, 0],
  //   mul(
  //     [1, 0, 0, 1, -iw * scale.value / 2, -ih * scale.value / 2],
  //     [c, -s, s, c, 0, 0]
  //   )
  // )
  // const dx = d[0] * cx.value + d[2] * cy.value + d[4]
  // const dy = d[1] * cx.value + d[3] * cy.value + d[5]
  // ここで求めている行列はスケーリング前の（全体座標系と同じ縮尺の）行列。
  const dx = c * posArray.value.center.x / posArray.value.scale + s * posArray.value.center.y / posArray.value.scale - iw / 2
  const dy = -s * posArray.value.center.x / posArray.value.scale + c * posArray.value.center.y / posArray.value.scale - ih / 2

  // canvasの座標変換行列の逆行列。
  // 2番目の行列で使ってる(dx, dy)はスケーリング後の行列。
  // だから合成後の行列では1/sc倍している。
  // [ c / sc s / sc -dx / sc]   [1/sc    0 0]   [1 0 -dx]   [ c s 0]
  // [-s / sc c / sc -dy / sc] = [   0 1/sc 0] * [0 1 -dy] * [-s c 0]
  // [      0      0        1]   [   0    0 1]   [0 0   1]   [ 0 0 1]
  const x0 = c / posArray.value.scale * x + s / posArray.value.scale * y - dx
  const y0 = -s / posArray.value.scale * x + c / posArray.value.scale * y - dy
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
  const c = Math.cos(posArray.value.angle)
  const s = Math.sin(posArray.value.angle)
  const dx = c * posArray.value.center.x + s * posArray.value.center.y - iw * posArray.value.scale / 2
  const dy = -s * posArray.value.center.x + c * posArray.value.center.y - ih * posArray.value.scale / 2

  // マウス座標の変換行列の逆行列。
  // [c / sc -s / sc c * dx - s * dy]   [1 0 c * dx - s * dy]   [c -s 0]   [sc  0 0]
  // [s / sc  c / sc s * dx + c * dy] = [0 1 s * dx + c * dy] * [s  c 0] * [ 0 sc 0]
  // [     0       0               1]   [0 0               1]   [0  0 1]   [ 0  0 1]
  // 変換行列を全部掛け合わせてからtransformするときは、全て元座標系に対する単位で指定する。
  viewctx.value?.transform(c * posArray.value.scale, s * posArray.value.scale, -s * posArray.value.scale, c * posArray.value.scale, c * dx - s * dy, s * dx + c * dy)
  // 順番にtransformするときは、変換後の座標系に対して次の変形が適用される。
  // ex.: scaleの後に（元座標系で）translate(dx, dy)したいときはtranslate(dx / sc, dy / sc)としなければならない。
  // viewctx.value?.transform(scale.value, 0, 0, scale.value, 0, 0)
  // viewctx.value?.transform(c, s, -s, c, 0, 0)
  // viewctx.value?.transform(1, 0, 0, 1, dx / scale.value, dy / scale.value)
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
  setAngle(posArray.value.angle + 0.05)
}

const decAngle = () => {
  setAngle(posArray.value.angle - 0.05)
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
      <canvas ref="viewcanvas" class="w-full h-full" @pointerdown.prevent="dragstart" @pointermove.prevent="dragmove"
        @pointerup.prevent="dragend"></canvas>
    </div>
    <canvas ref="buffcanvas" class="hidden"></canvas>
  </div>
</template>