<script setup lang="ts">
import useViewPosition from '~/composables/imagePos';
import init, {Layer} from '@/assets/wasm/wasm'
init()

const { buffcanvas, undo, redo } = useImage()
const { posArray, setAngle } = useViewPosition()
const incAngle = () => {
  setAngle(posArray.value.angle + 0.05)
}

const decAngle = () => {
  setAngle(posArray.value.angle - 0.05)
}

async function exoprtAsPng() {
  const blob = await buffcanvas.value?.convertToBlob()
  if (blob === undefined) throw new Error("no image data")
  const link = document.createElement("a")
  link.href = URL.createObjectURL(blob)
  link.download = "image.png"
  link.click()
}

let layer: Layer
function newlayer () {
  const width = 8
  const height = 16
  layer = Layer.new(width, height)
  console.log(layer.len())
}
</script>

<template>
  <div class="p-2 flex flex-row gap-2 bg-slate-200">
    <button @click="incAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">+</button>
    <button @click="decAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">-</button>
    <button @click="exoprtAsPng" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">PNG↓</button>
    <button @click="undo" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">Undo</button>
    <button @click="redo" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">Redo</button>
    <button @click="newlayer" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">new</button>
  </div>
</template>