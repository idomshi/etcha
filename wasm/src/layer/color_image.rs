use super::{BoundingBox, ImageLayer};
use crate::utils;
use std::convert::TryInto;

#[derive(Debug)]
pub struct ColorImage {
    pixels: Vec<u8>,
    width: i32,
    height: i32,
    is_drawing: bool,
    previouse_pos: super::Position,
}

impl ImageLayer for ColorImage {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox {
        let mut result = BoundingBox {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };
        if self.is_drawing {
            if pressure == 0.0 {
                self.is_drawing = false;

                // undoバッファに突っ込む。
            };
            self.line(&super::Position {
                x: x,
                y: y,
                pressure: pressure,
            });
            result = BoundingBox {
                left: x.min(self.previouse_pos.x).floor() as u32,
                top: y.min(self.previouse_pos.y).floor() as u32,
                width: (self.previouse_pos.x - x).abs().ceil() as u32 + 1,
                height: (self.previouse_pos.y - y).abs().ceil() as u32 + 1,
            };
            self.previouse_pos = super::Position {
                x: x,
                y: y,
                pressure: pressure,
            };
        } else {
            self.is_drawing = true;
            result = BoundingBox {
                left: x.floor() as u32,
                top: y.floor() as u32,
                width: 1,
                height: 1,
            };
            self.previouse_pos = super::Position {
                x: x,
                y: y,
                pressure: pressure,
            };
            self.plot(x.round() as i32, y.round() as i32);
        }

        result
    }

    fn pixel_pointer(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    fn pixel(&mut self) -> &mut Vec<u8> {
        &mut self.pixels
    }
}

impl ColorImage {
    pub fn new(width: i32, height: i32) -> ColorImage {
        utils::set_panic_hook();
        // Todo: widthとheightの範囲をチェックしないといけないけどあとで。
        let length: usize = (width as u32 * height as u32 * 4).try_into().unwrap();
        ColorImage {
            pixels: vec![0; length],
            width: width,
            height: height,
            is_drawing: false,
            previouse_pos: super::Position {
                x: 0.0,
                y: 0.0,
                pressure: 0.0,
            },
        }
    }

    /// p1からp2まで直線を描画する。
    fn line(&mut self, p2: &super::Position) {
        let p1 = &self.previouse_pos;
        let x0 = p1.x.round() as i32;
        let y0 = p1.y.round() as i32;
        let x1 = p2.x.round() as i32;
        let y1 = p2.y.round() as i32;
        let dx = x1.abs_diff(x0) as i32;
        let dy = y1.abs_diff(y0) as i32;
        let sx = if x0 < x1 { 1 } else { -1 } as i32;
        let sy = if y0 < y1 { 1 } else { -1 } as i32;
        let mut err = dx as i32 - dy as i32;

        let mut x = x0;
        let mut y = y0;

        loop {
            self.plot(x, y);
            if x == x1 && y == y1 {
                break;
            }
            let e2 = 2 * err;
            if e2 > -dy {
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
    fn plot(&mut self, x: i32, y: i32) {
        if x < 0 || x > self.width || y < 0 || y > self.height {
            return;
        }
        let idx = ((y * self.width as i32 + x) * 4) as usize;
        if idx > self.pixels.len() {
            return;
        }
        self.pixels[idx] = 0;
        self.pixels[idx + 1] = 0;
        self.pixels[idx + 2] = 0;
        self.pixels[idx + 3] = 255;
    }
}
