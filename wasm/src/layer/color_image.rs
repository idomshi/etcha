use std::convert::TryInto;

#[derive(Debug)]
pub struct ColorImage {
    pub pixels: Vec<u8>,
}

impl ColorImage {
    pub fn new(width: u16, height: u16) -> ColorImage {
        let length: usize = (width * height * 4).try_into().unwrap();
        ColorImage {
            pixels: vec![0; length],
        }
    }
}
