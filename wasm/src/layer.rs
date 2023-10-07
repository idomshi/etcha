pub mod color_image;
pub mod folder;

use wasm_bindgen::prelude::wasm_bindgen;

use crate::utils;

#[derive(Debug)]
pub struct BoundingBox {
    left: u32,
    top: u32,
    width: u32,
    height: u32,
}

pub trait ImageLayer {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox;
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
pub struct Layer {
    data: Box<dyn ImageLayer>,
}

#[wasm_bindgen]
impl Layer {
    pub fn new(width: i32, height: i32) -> Layer {
        utils::set_panic_hook();

        let mut bg_layer = color_image::ColorImage::new(width, height);
        let bg_pixel = bg_layer.pixel();
        bg_pixel.fill(255);

        let fore_layer = color_image::ColorImage::new(width, height);

        // 引数の型がi32なのは間違いでは？
        let mut folder = folder::Folder::new(width as u32, height as u32);
        folder.add_layers(&mut vec![Box::new(bg_layer), Box::new(fore_layer)]);

        Layer {
            data: Box::new(folder),
        }
    }

    pub fn pixels(&self) -> *const u8 {
        self.data.pixel_pointer()
    }

    pub fn stroke(&mut self, x: f64, y: f64, pressure: f64) {
        self.data.stroke(x, y, pressure);
    }
}
