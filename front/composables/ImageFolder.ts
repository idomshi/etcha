import { Layer } from "./Layers";
import type { BoundingBox, Position } from "./useImage";

export class ImageFolder {
  private name: string;
  private w: number;
  private h: number;
  private layers: Layer[] = [];
  private activeLayer: number;
  private cache: Uint8ClampedArray;

  public constructor(width: number, height: number) {
    this.name = "folder" + Math.floor(Math.random() * 10);
    this.w = width;
    this.h = height;
    this.cache = new Uint8ClampedArray(width * height * 4);
    this.activeLayer = -1;
  }

  public add(layer: Layer) {
    this.activeLayer = this.layers.length
    this.layers.push(layer)
    this.redrawCache({ left: 0, top: 0, width: this.w, height: this.h })
  }

  public get image(): Uint8ClampedArray {
    return this.cache
  }

  private redrawCache(bb: BoundingBox) {
    for (const layer of this.layers) {
      for (let r = bb.top; r < bb.top + bb.height; ++r) {
        const row = r * this.w
        for (let c = bb.left; c < bb.left + bb.width; ++c) {
          const idx = (row + c) * 4
          const opacity = layer.image[idx + 3] / 255
          this.cache[idx] = layer.image[idx] * opacity + this.cache[idx] * (1 - opacity)
          this.cache[idx + 1] = layer.image[idx + 1] * opacity + this.cache[idx + 1] * (1 - opacity)
          this.cache[idx + 2] = layer.image[idx + 2] * opacity + this.cache[idx + 2] * (1 - opacity)
          this.cache[idx + 3] = Math.max(layer.image[idx + 3], this.cache[idx + 3])
        }
      }
    }
  }

  public stroke(pos: Position): BoundingBox {
    const result = this.layers[this.activeLayer]?.stroke(pos)
      || { left: 0, top: 0, width: 0, height: 0 }
    this.redrawCache(result)
    return result
  }
}
