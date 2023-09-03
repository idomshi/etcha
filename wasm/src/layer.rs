pub mod color_image;

use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Debug)]
pub struct BoundingBox {
    left: u32,
    top: u32,
    width: u32,
    height: u32,
}

pub trait ImageLayer {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox;
    fn pixels(&self) -> *const u8;
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Position {
    pub x: f64,
    pub y: f64,
    pub pressure: f64,
}

#[wasm_bindgen]
pub struct Layer {
    data: Box<dyn ImageLayer>,
}

#[wasm_bindgen]
impl Layer {
    pub fn new(width: u16, height: u16) -> Layer {
        Layer {
            data: Box::new(color_image::ColorImage::new(width, height)),
        }
    }

    pub fn pixels(&self) -> *const u8 {
        self.data.pixels()
    }

    pub fn stroke(&mut self, x: f64, y: f64, pressure: f64) {
        self.data.stroke(x, y, pressure);
    }
}
