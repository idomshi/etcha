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

  function zoomIn() {
    posArray.value.scale *= 1.25
  }

  function zoomOut() {
    posArray.value.scale *= 0.8
  }

  return {
    posArray: readonly(posArray),
    setCenter,
    setAngle,
    zoomIn,
    zoomOut,
  };
}
