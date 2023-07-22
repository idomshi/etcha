export class UndoBuffer<T> {
  private undoStack: Array<T>;
  private redoStack: Array<T>;

  constructor(init: T) {
    this.undoStack = [];
    this.redoStack = [init];
  }

  push(item: T) {
    const tmp = this.redoStack.pop();
    if (tmp !== undefined) {
      this.undoStack.push(tmp);
    }
    this.redoStack = [item];
  }

  undo() {
    if (this.undoStack.length === 0) {
      return;
    }

    const tmp = this.undoStack.pop();
    if (tmp === undefined) return;
    this.redoStack.push(tmp);
    return tmp;
  }

  redo() {
    if (this.redoStack.length === 0) {
      return;
    }

    const tmp = this.redoStack.pop();
    if (tmp === undefined) return;
    this.undoStack.push(tmp);
    return this.redoStack[this.redoStack.length - 1];
  }

  clear() {
    this.undoStack = [];
    this.redoStack = this.redoStack.slice(-1);
  }
}
