/** @flow */
import type { Signal } from "../ocrConfig";

export class OcrError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}

export class LowSignalError extends OcrError {
  constructor(row: Signal[], total: number) {
    super(`Signal for row was unexpectedly low: ${total}\n${row.toString()}`);
  }
}

export class UnclassifiedSignalError extends OcrError {
  constructor(row: Signal[]) {
    super(
      `Signal was detected in the row, but the processor did not classify it as left, middle, or right in nature\n` +
        row.toString()
    );
  }
}

export class InconclusiveMiddleRowEvaluationError extends OcrError {
  constructor(row: Signal[], left: boolean, middle: boolean, right: boolean) {
    super(
      `Unexpected results for middle row evaluation\n${row.toString()}\n` +
        `Left: ${left.toString()}\nMiddle: ${middle.toString()}\nRight: ${right.toString()}`
    );
  }
}

export class MiddleRowHighSignalError extends OcrError {
  constructor(row: Signal[], total: number) {
    super(
      `Signal for middle row was unexpectedly high: ${total}\n${row.toString()}`
    );
  }
}
