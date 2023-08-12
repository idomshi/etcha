// マウス座標の変換行列の逆行列。
// [c / sc -s / sc c * dx - s * dy]   [1 0 c * dx - s * dy]   [c -s 0]   [sc  0 0]
// [s / sc  c / sc s * dx + c * dy] = [0 1 s * dx + c * dy] * [s  c 0] * [ 0 sc 0]
// [     0       0               1]   [0 0               1]   [0  0 1]   [ 0  0 1]
// 変換行列を全部掛け合わせてからtransformするときは、全て元座標系に対する単位で指定する。
// 順番にtransformするときは、変換後の座標系に対して次の変形が適用される。
// ex.: scaleの後に（元座標系で）translate(dx, dy)したいときはtranslate(dx / sc, dy / sc)としなければならない。
// viewctx.value?.transform(scale.value, 0, 0, scale.value, 0, 0)
// viewctx.value?.transform(c, s, -s, c, 0, 0)
// viewctx.value?.transform(1, 0, 0, 1, dx / scale.value, dy / scale.value)

import useViewPosition from "./imagePos"

export function useTransform() {
  const { posArray } = useViewPosition()
  const { width, height } = useImage()

  const c = computed(() => Math.cos(posArray.value.angle))
  const s = computed(() => Math.sin(posArray.value.angle))
  // width, heightがundefinedのとき、dx, dyを本当に0にしていいのかをちゃんと検討していない。
  const dx = computed(() =>
    width.value === undefined
      ? 0
      : c.value * posArray.value.center.x
      + s.value * posArray.value.center.y
      - width.value * posArray.value.scale / 2
  )
  const dy = computed(() =>
    height.value === undefined
      ? 0
      : -s.value * posArray.value.center.x
      + c.value * posArray.value.center.y
      - height.value * posArray.value.scale / 2
  )

  const t1 = computed(() => c.value * posArray.value.scale)
  const t2 = computed(() => s.value * posArray.value.scale)
  const t3 = computed(() => -s.value * posArray.value.scale)
  const t4 = computed(() => c.value * posArray.value.scale)
  const t5 = computed(() => c.value * dx.value - s.value * dy.value)
  const t6 = computed(() => s.value * dx.value + c.value * dy.value)

  return {
    t1,
    t2,
    t3,
    t4,
    t5,
    t6,
  }
}