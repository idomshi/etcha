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

  const line = (pos1: Position, pos2: Position): void => {
    const deltax = Math.round(pos2.x - pos1.x)
    const deltay = Math.round(pos2.y - pos1.y)

    if (deltax === 0) {
      const intx = Math.round(pos1.x)
      for (let inty = Math.round(Math.min(pos1.y, pos2.y)); inty <= Math.round(Math.max(pos1.y, pos2.y)); ++inty) {
        const idx = (inty * width + intx) * 4
        pixel[idx] = pixel[idx + 1] = pixel[idx+2] = 0
        pixel[idx + 3] = 255
      }
      return
    }

    let error = 0
    const deltaerr = Math.abs(deltay / deltax)
    let inty = Math.round(pos1.y)
    for (let intx = Math.round(Math.min(pos1.x, pos2.x)); intx <= Math.round(Math.max(pos1.x, pos2.x)); ++intx) {
        const idx = (inty * width + intx) * 4
        pixel[idx] = pixel[idx + 1] = pixel[idx+2] = 0
        pixel[idx + 3] = 255
        error += deltaerr
        if (error >= 0.5) {
          inty += 1
          error -= 1.0
        }
    }
  }

  const stroke = (pos: Position): void => {
    // console.log(pos)

    if (isDrawing) {
      if (pos.pressure === 0) {
        isDrawing = false
        console.log('drawing end')
      }
      line(previousePos, pos)
      previousePos = pos

    } else {
      isDrawing = true
      previousePos = pos
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

