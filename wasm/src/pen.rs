pub mod simple_pen;

use crate::layer::Position;

pub trait DrawingPen {
    fn line(&self, p0: &Position, p1: &Position, width: i32, height: i32, pixels: &mut Vec<u8>);
}
