import { describe, expect, test } from "vitest";
import { UndoBuffer } from "./UndoBuffer";

// UndoBufferのpointerはcurrentの状態を指すようにする。

describe("undo", () => {
  test("test 1", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    const result = ub.undo();
    expect(result).toEqual(0);
  });

  test("test 2", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    const result = ub.undo();
    expect(result).toEqual(1);
  });

  // test("バッファの長さより多くpushされても最後にpushされたのが返る。", () => {
  //   const ub = new UndoBuffer<number>(0);
  //   ub.push(1);
  //   ub.push(2);
  //   ub.push(3);
  //   const result = ub.undo();
  //   expect(result).toEqual(3);
  // });

  test("バッファの長さより多くundoされるとundefinedが返る。", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.push(3);
    ub.undo();
    ub.undo();
    ub.undo();
    const result = ub.undo();
    expect(result).toEqual(undefined);
  });

  test("途中で一回undoを挟んだときは2が返る。", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.push(3);
    ub.undo();
    ub.push(4);
    const result = ub.undo();
    expect(result).toEqual(2);
  });

  test("バッファの長さより多くundoした後もpushできる。", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    ub.undo();
    ub.push(3);
    const result = ub.undo();
    expect(result).toEqual(0);
  });
});

describe("redo", () => {
  test("redo test 1", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    const result = ub.redo();
    expect(result).toEqual(1);
  });

  test("redo test 2", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    ub.redo();
    const result = ub.redo();
    expect(result).toEqual(2);
  });

  test("redo test 3", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    ub.redo();
    ub.redo();
    const result = ub.redo();
    expect(result).toEqual(undefined);
  });

  test("redo test 4", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    ub.redo();
    ub.redo();
    ub.push(3);
    const result = ub.redo();
    expect(result).toEqual(undefined);
  });

  test("redo test 5", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.undo();
    ub.undo();
    ub.push(3);
    const result = ub.redo();
    expect(result).toEqual(undefined);
  });

  test("redo test 6", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.push(3);
    let result = ub.undo();
    expect(result).toEqual(2);
    result = ub.undo();
    expect(result).toEqual(1);
    result = ub.undo();
    expect(result).toEqual(0);
    result = ub.undo();
    expect(result).toEqual(undefined);
  });

  test("redo test 7", () => {
    const ub = new UndoBuffer<number>(0);
    ub.push(1);
    ub.push(2);
    ub.push(3);
    let result = ub.undo();
    expect(result).toEqual(2);
    result = ub.undo();
    expect(result).toEqual(1);
    result = ub.undo();
    expect(result).toEqual(0);

    result = ub.redo();
    expect(result).toEqual(1);
    result = ub.redo();
    expect(result).toEqual(2);
    result = ub.redo();
    expect(result).toEqual(3);
    result = ub.redo();
    expect(result).toEqual(undefined);
  });
});
