import { ViewPosition } from "./imagePos"

export function useConvert(posArray: Ref<ViewPosition>) {
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
