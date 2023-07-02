export const useImage = (imageData: Ref<ImageData>) => {
  // やっぱりImageDataが使えないよって文句言ってるんだ！！
  // SSRを切ればImageDataも使えそうだ！！
  const pixel = imageData.value.data
  const width = imageData.value.width
  const height = imageData.value.height
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

  interface Position {
    x: number,
    y: number,
    pressure: number
  }
  let isDrawing = false
  let previousePos: Position = { x: 0, y: 0, pressure: 0 }
  const stroke = (pos: Position): void => {
    // console.log(pos)

    if (isDrawing) {
      if (pos.pressure === 0) {
        isDrawing = false
        console.log('drawing end')
      }

    } else {
      isDrawing = true
      // previousePos = pos
      const idx = (Math.round(pos.y) * width + Math.round(pos.x)) * 4
      pixel[idx] = pixel[idx + 1] = pixel[idx + 2] = 0
      pixel[idx + 3] = 255
      console.log(['dot draw', pos, idx])
    }
    imageData.value = new ImageData(pixel, width)
  }

  return {
    imageData,
    modify,
    stroke,
  }
}

