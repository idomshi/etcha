mod simple_pen;

use crate::layer::Position;
use crate::utils;

pub trait DrawingPen {
    fn line(&self, p0: &Position, p1: &Position, width: i32, height: i32, pixels: &mut Vec<u8>);
}

pub struct Pen {
    pub pen: Box<dyn DrawingPen>,
}

impl Pen {
    pub fn new() -> Pen {
        utils::set_panic_hook();
        Pen {
            pen: Box::new(simple_pen::SimplePen::new()),
        }
    }

    pub fn line(
        &self,
        p0: &Position,
        p1: &Position,
        width: i32,
        height: i32,
        pixels: &mut Vec<u8>,
    ) {
        self.pen.line(p0, p1, width, height, pixels);
    }
}
