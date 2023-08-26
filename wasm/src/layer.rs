pub mod color_image;

use color_image::ColorImage;
use wasm_bindgen::prelude::wasm_bindgen;

#[derive(Debug)]
pub struct BoundingBox {
    left: u32,
    top: u32,
    width: u32,
    height: u32,
}

pub trait ImageLayer {
    fn new(width: u16, height: u16) -> Self;
    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox;
}

enum LayerType {
    ColorImage(ColorImage),
}

#[wasm_bindgen]
pub struct Layer {
    data: LayerType,
}

#[wasm_bindgen]
impl Layer {
    pub fn new(width: u16, height: u16) -> Layer {
        Layer {
            data: LayerType::ColorImage(color_image::ColorImage::new(width, height)),
        }
    }

    pub fn len(&self) -> usize {
        match &self.data {
            LayerType::ColorImage(v) => v.pixels.len(),
        }
    }
}
