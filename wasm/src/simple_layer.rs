use wasm_bindgen::prelude::wasm_bindgen;

use crate::layer::Position;

#[wasm_bindgen]
pub struct SimpleLayer {
    width: u16,
    height: u16,
    pixels: Vec<u8>,
    is_drawing: bool,
    previouse_pos: Position,
}

#[wasm_bindgen]
impl SimpleLayer {
    pub fn new(width: u16, height: u16) -> Self {
        SimpleLayer {
            width: width,
            height: height,
            pixels: vec![255; (width as u32 * height as u32 * 4) as usize],
            is_drawing: false,
            previouse_pos: Position {
                x: 0.0,
                y: 0.0,
                pressure: 0.0,
            },
        }
    }

    pub async fn redraw(&mut self) {
        for row in 0..self.height as u32 {
            for col in 0..self.width as u32 {
                let idx = ((row * self.width as u32 + col) * 4) as usize;
                self.pixels[idx] = 255;
                self.pixels[idx + 1] = (255 * row / self.height as u32) as u8;
                self.pixels[idx + 2] = (255 * col / self.width as u32) as u8;
                self.pixels[idx + 3] = 255;
            }
        }
    }

    pub fn stroke(&mut self, x: f64, y: f64, pressure: f64) {
        if self.is_drawing {
            if pressure == 0.0 {
                self.is_drawing = false;
            }
            let pos = Position { x, y, pressure };
            self.line(&pos);
            self.previouse_pos = pos;
        } else {
            self.is_drawing = true;
            self.previouse_pos = Position { x, y, pressure };
            self.plot(x.round() as i32, y.round() as i32)
        }
    }

    pub fn pixels(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    pub fn width(&self) -> u16 {
        self.width
    }

    pub fn height(&self) -> u16 {
        self.height
    }
}

impl SimpleLayer {
    fn plot(&mut self, x: i32, y: i32) {
        let idx = ((y * self.width as i32 + x) * 4) as usize;
        self.pixels[idx] = 0;
        self.pixels[idx + 1] = 0;
        self.pixels[idx + 2] = 0;
    }

    fn line(&mut self, p2: &Position) {
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
}
