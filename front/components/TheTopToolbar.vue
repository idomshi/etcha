<script setup lang="ts">
import useViewPosition from '~/composables/imagePos';
import { usePenState } from '~/composables/usePenState';

const { buffcanvas, undo, redo } = useImage()
const { posArray, setAngle } = useViewPosition()
const { erase } = usePenState()
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
</script>

<template>
  <div class="p-2 flex flex-row gap-2 bg-slate-200">
    <button @click="incAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">+</button>
    <button @click="decAngle" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">-</button>
    <button @click="exoprtAsPng" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">PNG↓</button>
    <button @click="undo" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">Undo</button>
    <button @click="redo" class="px-4 h-8 bg-slate-300 border-2 border-slate-400 rounded">Redo</button>
    <div class="flex flex-row items-center">
      <label for="erase-check">消しゴム</label>
      <input type="checkbox" id="erase-check" v-model="erase" class="ml-1">
    </div>
  </div>
</template>