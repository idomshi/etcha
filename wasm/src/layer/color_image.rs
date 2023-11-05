use super::{BoundingBox, ImageLayer};
use crate::pen::DrawingPen;
use crate::utils;
use std::convert::TryInto;
extern crate web_sys;

#[allow(unused_macros)]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

// #[derive(Debug)]
pub struct ColorImage {
    pixels: Vec<u8>,
    width: i32,
    height: i32,
    is_drawing: bool,
    previouse_pos: super::Position,
    prev_pxs: Vec<u8>,
}

impl ImageLayer for ColorImage {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64, pen: &Box<dyn DrawingPen>) -> BoundingBox {
        let radius = 4;
        let mut result = BoundingBox {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };
        if self.is_drawing {
            if pressure == 0.0 {
                self.is_drawing = false;
                self.prev_pxs = self.pixels.clone();

                // undoバッファに突っ込む。
            };
            self.line(
                &super::Position {
                    x: x,
                    y: y,
                    pressure: pressure,
                },
                pen,
            );
            result = BoundingBox {
                left: x.min(self.previouse_pos.x).floor() as i32 - radius,
                top: y.min(self.previouse_pos.y).floor() as i32 - radius,
                width: (self.previouse_pos.x - x).abs().ceil() as i32 + 1 + radius + radius,
                height: (self.previouse_pos.y - y).abs().ceil() as i32 + 1 + radius + radius,
            };
            self.previouse_pos = super::Position {
                x: x,
                y: y,
                pressure: pressure,
            };
        } else {
            self.is_drawing = true;
            result = BoundingBox {
                left: x.floor() as i32 - radius,
                top: y.floor() as i32 - radius,
                width: 1 + radius + radius,
                height: 1 + radius + radius,
            };
            self.previouse_pos = super::Position {
                x: x,
                y: y,
                pressure: pressure,
            };
            self.line(
                &super::Position {
                    x: x,
                    y: y,
                    pressure: pressure,
                },
                pen,
            )
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
            prev_pxs: vec![0; length],
        }
    }

    /// p1からp2まで直線を描画する。
    fn line(&mut self, p2: &super::Position, pen: &Box<dyn DrawingPen>) {
        pen.line(
            &self.previouse_pos,
            p2,
            self.width,
            self.height,
            &mut self.pixels,
        )
    }

    /// 点をプロットする。
    fn plot(&mut self, x: i32, y: i32, erase: bool) {
        if x < 0 || x > self.width || y < 0 || y > self.height {
            return;
        }
        let idx = ((y * self.width as i32 + x) * 4) as usize;
        if idx > self.pixels.len() {
            return;
        }

        if erase {
            self.pixels[idx] = 0;
            self.pixels[idx + 1] = 0;
            self.pixels[idx + 2] = 0;
            self.pixels[idx + 3] = 0;
        } else {
            self.pixels[idx] = 0;
            self.pixels[idx + 1] = 0;
            self.pixels[idx + 2] = 0;
            self.pixels[idx + 3] = 255;
        }
    }

    /// 円をプロットする。
    fn plot_circle(&mut self, x: i32, y: i32, erase: bool) {
        let radius = 4;
        let tr = radius * radius;

        if x < 0 - radius || x > self.width + radius || y < 0 - radius || y > self.height + radius {
            return;
        }

        let mut idx: usize;
        for r in (y - radius).max(0)..(y + radius).min(self.height) {
            let row = r * self.width;
            let ty = (r - y) * (r - y);
            for c in (x - radius).max(0)..(x + radius).min(self.width) {
                idx = (row + c) as usize * 4;
                if idx > self.pixels.len() {
                    return;
                }

                if (c - x) * (c - x) + ty < tr {
                    if erase {
                        self.pixels[idx] = 0;
                        self.pixels[idx + 1] = 0;
                        self.pixels[idx + 2] = 0;
                        self.pixels[idx + 3] = 0;
                    } else {
                        self.pixels[idx] = 0;
                        self.pixels[idx + 1] = 0;
                        self.pixels[idx + 2] = 0;
                        self.pixels[idx + 3] = 255;
                    }
                }
            }
        }
    }
}
