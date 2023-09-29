use crate::layer::{BoundingBox, ImageLayer};

#[derive(Debug)]
struct Folder {
    items: Vec<dyn ImageLayer>,
    active: Option<usize>,
    pixels: Vec<u8>,
}

impl ImageLayer for Folder {
    fn stroke(&mut self, x: f64, y: f64, pressure: f64) -> BoundingBox {
        match self.active {
            Some(i) => self.items[i].stroke(x, y, pressure),
            None => BoundingBox {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
            },
        }
    }

    fn pixels(&self) -> *const u8 {
        self.pixels.as_ptr()
    }
}

impl Folder {
    pub fn new() -> Folder {
        Folder {
            items: vec![],
            active: None,
            pixels: vec![],
        }
    }

    pub fn add_layers(&mut self, layers: &mut Vec<dyn ImageLayer>) {
        self.items.append(layers);
    }
}
