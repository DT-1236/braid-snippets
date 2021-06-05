/** @flow */

import getRowMetrics from "./getRowMetrics";
import { MINIMUM_ROW_SIGNAL, type Signal } from "../ocrConfig";

export const LOW_ROW_RESULTS = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  MIDDLE: "MIDDLE",
  LEFT_AND_RIGHT: "LEFT_AND_RIGHT",
  MIDDLE_AND_RIGHT: "MIDDLE_AND_RIGHT",
  WIDE: "WIDE",
};
export default function analyzeLow(row: Signal[]) {
  const [left, middle, right, total] = getRowMetrics(row);

  if (total < MINIMUM_ROW_SIGNAL) {
    throw new Error(`Signal for middle row was unexpectedly low: ${total}`);
  }
  if (left && middle && right) {
    return LOW_ROW_RESULTS.WIDE;
  }
  if (right) {
    if (left) {
      return LOW_ROW_RESULTS.LEFT_AND_RIGHT;
    }
    if (middle) {
      return LOW_ROW_RESULTS.MIDDLE_AND_RIGHT;
    }
    return LOW_ROW_RESULTS.RIGHT;
  }

  if (left) {
    return LOW_ROW_RESULTS.LEFT;
  }
  if (middle) {
    return LOW_ROW_RESULTS.MIDDLE;
  }

  throw new Error(
    `Somehow minimum signal was met for low row evaluation, but results were inconclusive`
  );
}
