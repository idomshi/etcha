use wasm_bindgen::prelude::wasm_bindgen;

#[wasm_bindgen]
pub struct SimpleLayer {
    width: u16,
    height: u16,
    pixels: Vec<u8>,
}

#[wasm_bindgen]
impl SimpleLayer {
    pub fn new(width: u16, height: u16) -> Self {
        SimpleLayer {
            width: width,
            height: height,
            pixels: vec![255; (width as u32 * height as u32 * 4) as usize],
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
