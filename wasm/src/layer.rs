pub mod color_image;
pub mod folder;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::pen::{simple_pen, DrawingPen};
use crate::utils;

#[derive(Debug)]
pub struct BoundingBox {
    left: i32,
    top: i32,
    width: i32,
    height: i32,
}

pub trait ImageLayer {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64, pen: &Box<dyn DrawingPen>) -> BoundingBox;
    fn pixel_pointer(&self) -> *const u8;
    fn pixel(&mut self) -> &mut Vec<u8>;
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Position {
    pub x: f64,
    pub y: f64,
    pub pressure: f64,
}

#[wasm_bindgen]
pub struct ImageDocument {
    layer: Box<dyn ImageLayer>,

    // penをスタックにしておくと戻るが出来る。
    pen: Box<dyn DrawingPen>,
}

#[wasm_bindgen]
impl ImageDocument {
    pub fn new(width: i32, height: i32) -> ImageDocument {
        utils::set_panic_hook();

        let mut bg_layer = color_image::ColorImage::new(width, height);
        let bg_pixel = bg_layer.pixel();
        bg_pixel.fill(255);

        let fore_layer = color_image::ColorImage::new(width, height);

        let mut folder = folder::Folder::new(width, height);
        folder.add_layers(&mut vec![Box::new(bg_layer), Box::new(fore_layer)]);

        let pen = simple_pen::SimplePen::new();

        ImageDocument {
            layer: Box::new(folder),
            pen: Box::new(pen),
        }
    }

    pub fn pixels(&self) -> *const u8 {
        self.layer.pixel_pointer()
    }

    pub fn stroke(&mut self, x: f64, y: f64, pressure: f64) {
        self.layer.stroke(x, y, pressure, &self.pen);
    }
}
