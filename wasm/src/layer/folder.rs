use crate::{
    layer::{BoundingBox, ImageLayer},
    pen::DrawingPen,
    utils,
};

pub struct Folder {
    width: i32,
    height: i32,
    items: Vec<Box<dyn ImageLayer>>,
    active: Option<usize>,
    pixels: Vec<u8>,
    cache: Vec<f64>,
}

impl ImageLayer for Folder {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64, pen: &Box<dyn DrawingPen>) -> BoundingBox {
        let bb = match self.active {
            Some(i) => self.items[i].stroke(x, y, pressure, pen),
            None => BoundingBox {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
            },
        };
        self.redraw_cache(&bb);
        bb
    }

    fn pixel_pointer(&self) -> *const u8 {
        self.pixels.as_ptr()
    }

    fn pixel(&mut self) -> &mut Vec<u8> {
        &mut self.pixels
    }
}

impl Folder {
    pub fn new(width: i32, height: i32) -> Folder {
        utils::set_panic_hook();

        let length = (width * height * 4) as usize;
        Folder {
            width,
            height,
            items: vec![],
            active: None,
            pixels: vec![0; length],
            cache: vec![0.0; length],
        }
    }

    pub fn add_layers(&mut self, layers: &mut Vec<Box<dyn ImageLayer>>) {
        self.items.append(layers);
        if self.items.len() > 0 {
            self.active = Some(self.items.len() - 1);
        }
        self.redraw_cache(&BoundingBox {
            left: 0,
            top: 0,
            width: self.width,
            height: self.height,
        });
    }

    fn redraw_cache(&mut self, bb: &BoundingBox) {
        for layer in &mut self.items {
            for r in bb.top.max(0)..=(bb.top + bb.height).min(self.height - 1) {
                let row = r * self.width;
                for c in bb.left.max(0)..=(bb.left + bb.width).min(self.width - 1) {
                    let idx = ((row + c) * 4) as usize;
                    let pixel = layer.pixel();
                    let opacity = pixel[idx + 3] as f64 / 255.0;
                    self.cache[idx] =
                        (pixel[idx] as f64 - self.cache[idx]) * opacity + self.cache[idx];
                    self.cache[idx + 1] = (pixel[idx + 1] as f64 - self.cache[idx + 1]) * opacity
                        + self.cache[idx + 1];
                    self.cache[idx + 2] = (pixel[idx + 2] as f64 - self.cache[idx + 2]) * opacity
                        + self.cache[idx + 2];
                    self.cache[idx + 3] =
                        opacity + self.cache[idx + 3] - opacity * self.cache[idx + 3];
                }
            }
        }

        for r in bb.top.max(0)..=(bb.top + bb.height).min(self.height - 1) {
            let row = r * self.width;
            for c in bb.left.max(0)..=(bb.left + bb.width).min(self.width - 1) {
                let idx = ((row + c) * 4) as usize;
                self.pixels[idx] = self.cache[idx].clamp(0.0, 255.0) as u8;
                self.pixels[idx + 1] = self.cache[idx + 1].clamp(0.0, 255.0) as u8;
                self.pixels[idx + 2] = self.cache[idx + 2].clamp(0.0, 255.0) as u8;
                self.pixels[idx + 3] = (self.cache[idx + 3] * 255.0).clamp(0.0, 255.0) as u8;
            }
        }
    }
}
