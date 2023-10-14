type Position = Vector2;
type Angle = number;
type Scale = number;

interface Vector2 {
  x: number;
  y: number;
}

export interface ViewPosition {
  center: Position;
  angle: Angle;
  scale: Scale;
}

export default function useViewPosition() {
  const posArray = useState<ViewPosition>("posArray", () => {
    return {
      center: { x: 0, y: 0 },
      angle: 0,
      scale: 1,
    }
  });

  function setCenter(x: number, y: number) {
    posArray.value.center = { x, y }
  }

  function setAngle(angle: number) {
    const n = 2 * Math.PI
    posArray.value.angle = ((angle % n) + n) % n
  }

  function zoomIn(x: number = 0, y: number = 0) {
    const factor = 1.25
    posArray.value.scale *= factor

    // ここで[x, y]から拡縮後のcenterを計算しなくてはならないのですが。
    posArray.value.center = {
      x: (posArray.value.center.x - x) * factor + x,
      y: (posArray.value.center.y - y) * factor + y
    }
  }

  function zoomOut(x: number = 0, y: number = 0) {
    const factor = 0.8
    posArray.value.scale *= factor
    posArray.value.center = {
      x: (posArray.value.center.x - x) * factor + x,
      y: (posArray.value.center.y - y) * factor + y
    }
  }

  return {
    posArray: readonly(posArray),
    setCenter,
    setAngle,
    zoomIn,
    zoomOut,
  };
}
