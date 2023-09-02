//! Imageを操作するWebAssembly
//!
//! フロントエンド側に読み込むには、
//! ```
//! import init, { greet } from '../assets/wasm/wasm'
//!
//! let memory: WebAssembly.Memory
//! let obj: (WasmStruct)
//! onMounted(() => {
//!   memory = (await init()).memory
//! })
//! ```
//!
//! という風に初期化しておいて、
//!
//! ```
//! obj = (WasmStruct).new()
//! const ptr = obj.pixels()
//! const length = obj.length()
//! const pixels = new Uint8ClampedArray(memory.buffer, ptr, length)
//! ```
//!
//! のようにメモリを参照する。
//!

mod layer;
mod simple_layer;
mod utils;

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, wasm!");
}
