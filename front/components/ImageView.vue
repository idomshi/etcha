<script setup lang="ts">
const viewcanvas = ref<HTMLCanvasElement>()
const viewctx = ref<CanvasRenderingContext2D>()
const buffcanvas = ref<HTMLCanvasElement>()
const buffctx = ref<CanvasRenderingContext2D>()
const width = 300
const height = 300

const useImage = (width: number, height: number) => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const imageData = ref(new ImageData(width, height))
  const pixel = imageData.value.data
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
    imageData.value = new ImageData(pixel, width) 
  }

  return {
    imageData,
    modify,
  }
}

const { imageData, modify } = useImage(width, height)

onMounted(() => {
  if (viewcanvas.value === undefined) throw new Error('canvasを初期化できませんでした');
  viewctx.value = viewcanvas.value.getContext('2d') || undefined

  if (buffcanvas.value === undefined) throw new Error('canvas?')
  buffctx.value = buffcanvas.value.getContext('2d') || undefined
})

const redraw = () => {
  console.log('redraw')
  if (buffcanvas.value === undefined) return
  if (viewcanvas.value === undefined) return
  buffcanvas.value.width = imageData.value.width
  buffcanvas.value.height = imageData.value.height
  buffctx.value?.putImageData(imageData.value, 0, 0)

  const cw = viewcanvas.value.clientWidth
  const ch = viewcanvas.value.clientHeight
  const w = Math.min(cw, imageData.value.width)
  const h = Math.min(ch, imageData.value.height)
  viewcanvas.value.width = cw
  viewcanvas.value.height = ch
  viewctx.value?.clearRect(0, 0, cw, ch)
  viewctx.value?.drawImage(buffcanvas.value, 0, 0, w, h, 0, 0, w, h)
}

watchEffect(redraw)

// const randomBox = () => {
//   if (buffcanvas.value === undefined) return
//   buffctx.value?.clearRect(0, 0, buffcanvas.value.width, buffcanvas.value.height)
//   const left = Math.floor(Math.random() * 100)
//   const top = Math.floor(Math.random() * 100)
//   const width = Math.floor(Math.random() * 100)
//   const height = Math.floor(Math.random() * 100)
//   buffctx.value?.fillRect(left, top, width, height)
//   redraw()
//   requestAnimationFrame(randomBox)
// }


</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <div class="p-2 flex flex-row gap-2 bg-slate-200">
      <button @click="modify" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">redraw</button>
    </div>
    <div class="h-full bg-slate-100">
      <canvas ref="viewcanvas" class="w-full h-full"></canvas>
    </div>
    <canvas ref="buffcanvas" class="hidden"></canvas>
  </div>
</template>