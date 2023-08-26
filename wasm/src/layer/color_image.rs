use super::{BoundingBox, ImageLayer};
use std::convert::TryInto;

#[derive(Debug, Clone, Copy)]
struct Position {
    x: f64,
    y: f64,
    pressure: f64,
}

#[derive(Debug)]
pub struct ColorImage {
    pub pixels: Vec<u8>,
    width: u16,
    height: u16,
    isDrawing: bool,
    previousePos: Position,
}

impl ImageLayer for ColorImage {
    fn new(width: u16, height: u16) -> ColorImage {
        let length: usize = (width * height * 4).try_into().unwrap();
        ColorImage {
            pixels: vec![0; length],
            width: width,
            height: height,
            isDrawing: false,
            previousePos: Position {
                x: 0.0,
                y: 0.0,
                pressure: 0.0,
            },
        }
    }

    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox {
        let mut result = BoundingBox {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };
        if self.isDrawing {
            if pressure == 0.0 {
                self.isDrawing = false;

                // undoバッファに突っ込む。
            };
            self.line(
                &self.previousePos.clone(),
                &Position {
                    x: x,
                    y: y,
                    pressure: pressure,
                },
            );
            result = BoundingBox {
                left: x.min(self.previousePos.x).floor() as u32,
                top: y.min(self.previousePos.y).floor() as u32,
                width: (self.previousePos.x - x).abs().ceil() as u32,
                height: (self.previousePos.y - y).abs().ceil() as u32,
            };
            self.previousePos = Position {
                x: x,
                y: y,
                pressure: pressure,
            };
        } else {
            self.isDrawing = true;
            result = BoundingBox {
                left: x.floor() as u32,
                top: y.floor() as u32,
                width: 1,
                height: 1,
            };
            self.previousePos = Position {
                x: x,
                y: y,
                pressure: pressure,
            };
            self.plot(x, y);
        }

        result
    }
}

impl ColorImage {
    /// p1からp2まで直線を描画する。
    fn line(&mut self, p1: &Position, p2: &Position) {
        let x0 = p1.x.round() as i32;
        let y0 = p1.y.round() as i32;
        let x1 = p2.x.round() as i32;
        let y1 = p2.y.round() as i32;
        let dx = x1.abs_diff(x0);
        let dy = y1.abs_diff(y0);
        let sx = if x0 < x1 { 1 } else { -1 } as i32;
        let sy = if y0 < y1 { 1 } else { -1 } as i32;
        let mut err = dx - dy;

        let mut x = x0;
        let mut y = y0;

        loop {
            self.plot(x as f64, y as f64);
            if x == x1 && y == y1 {
                break;
            }
            let e2 = 2 * err;
            if e2 as i32 > -(dy as i32) {
                err -= dy;
                x += sx;
            }
            if e2 < dx {
                err += dx;
                y += sy;
            }
        }
    }

    /// 点をプロットする。
    fn plot(&mut self, x: f64, y: f64) {
        let idx = ((y as usize) * (self.width as usize) + (x as usize)) * 4;
        self.pixels[idx] = 0;
        self.pixels[idx + 1] = 0;
        self.pixels[idx + 2] = 0;
        self.pixels[idx + 3] = 255;
    }
}
