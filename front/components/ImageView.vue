<script setup lang="ts">
import { useFps } from '@vueuse/core'
import useViewPosition from '~/composables/imagePos';

const { posArray, setCenter, zoomIn, zoomOut } = useViewPosition()
const { convert } = useConvert()

const size = { width: 1024, height: 1024 }
const { init, stroke } = useImage()
init(size.width, size.height)

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

const wheel = (e: WheelEvent) => {
  if (e.deltaY > 0) {
    zoomOut()
  } else {
    zoomIn()
  }
}

const fps = useFps()
</script>

<template>
  <div class="w-full h-screen flex flex-col">
    <TheTopToolbar></TheTopToolbar>
    <div class="w-full h-full relative">
      <TheCanvasArea></TheCanvasArea>
      <div class="absolute top-0 left-0 w-full h-full z-10 touch-pinch-zoom" @pointerdown.prevent="dragstart"
        @pointermove.prevent="dragmove" @pointerup.prevent="dragend" @wheel.prevent="wheel">
      </div>
      <div class="absolute top-16 left-4">{{ fps }} fps</div>
    </div>
  </div>
</template>
