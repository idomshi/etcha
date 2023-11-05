use crate::layer::Position;
use crate::utils;

use super::DrawingPen;

#[allow(unused_macros)]
macro_rules! log {
    ( $( $t:tt )* ) => {
        web_sys::console::log_1(&format!( $( $t )* ).into());
    }
}

#[derive(Debug)]
pub struct SimplePen {
    size: f64,
}

impl DrawingPen for SimplePen {
    fn line(&self, p0: &Position, p1: &Position, width: i32, height: i32, pixels: &mut Vec<u8>) {
        self.plot(p0, width, height, pixels);
        self.plot(
            &Position {
                x: (p0.x + p1.x) / 2.0,
                y: (p0.y + p1.y) / 2.0,
                pressure: (p0.pressure + p1.pressure) / 2.0,
            },
            width,
            height,
            pixels,
        );
        self.plot(p1, width, height, pixels);
    }

    fn size(&self) -> f64 {
        self.size
    }
}

impl SimplePen {
    pub fn new() -> SimplePen {
        utils::set_panic_hook();
        SimplePen { size: 4.0 }
    }

    pub fn plot(&self, p: &Position, width: i32, height: i32, pixels: &mut Vec<u8>) {
        let radius = self.size / 2.0;
        let tr = radius * radius;

        if p.x < 0.0 - radius
            || p.x > width as f64 + radius
            || p.y < 0.0 - radius
            || p.y > height as f64 + radius
        {
            return;
        }

        let mut idx: usize;
        for r in (-radius.round() as i32)..(radius.round() as i32) {
            let row = (r + p.y.round() as i32).max(0).min(height) * width;
            let ty = (r as f64) * (r as f64);
            for c in (-radius.round() as i32)..(radius.round() as i32) {
                idx = (row + (c + p.x.round() as i32).max(0).min(height)) as usize * 4;
                if idx > pixels.len() {
                    return;
                }

                if (c as f64) * (c as f64) + ty < tr {
                    pixels[idx] = 0;
                    pixels[idx + 1] = 0;
                    pixels[idx + 2] = 0;
                    pixels[idx + 3] = 255;
                }
            }
        }
    }
}
