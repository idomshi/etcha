import useViewPosition from "./imagePos"

export function useConvert() {
  const { posArray } = useViewPosition()
  const { width, height } = useImage()

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
  const c_sc = computed(() => Math.cos(posArray.value.angle) / posArray.value.scale)
  const s_sc = computed(() => Math.sin(posArray.value.angle) / posArray.value.scale)
  const dx = computed(() => width.value === undefined ? undefined : c_sc.value * posArray.value.center.x + s_sc.value * posArray.value.center.y - width.value / 2)
  const dy = computed(() => height.value === undefined ? undefined : -s_sc.value * posArray.value.center.x + c_sc.value * posArray.value.center.y - height.value / 2)

  const convert = (x: number, y: number) => {
    // canvasの座標変換行列の逆行列。
    // 2番目の行列で使ってる(dx, dy)はスケーリング後の行列。
    // だから合成後の行列では1/sc倍している。
    // [ c / sc s / sc -dx / sc]   [1/sc    0 0]   [1 0 -dx]   [ c s 0]
    // [-s / sc c / sc -dy / sc] = [   0 1/sc 0] * [0 1 -dy] * [-s c 0]
    // [      0      0        1]   [   0    0 1]   [0 0   1]   [ 0 0 1]
    // width, heightがundefinedのとき、x0, y0を本当にundefinedにしていいのかをちゃんと検討していない。
    const x0 = dx.value === undefined ? 0 : c_sc.value * x + s_sc.value * y - dx.value
    const y0 = dy.value === undefined ? 0 : -s_sc.value * x + c_sc.value * y - dy.value
    return [x0, y0]
  }

  return {
    convert,
  }
}
