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

  return {
    imageData,
    modify,
  }
}

