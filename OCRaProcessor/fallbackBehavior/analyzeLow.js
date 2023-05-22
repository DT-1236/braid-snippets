/** @flow */

import getRowMetrics from "./getRowMetrics";
import { MINIMUM_ROW_SIGNAL, type Signal } from "../ocrConfig";
import { LowSignalError, UnclassifiedSignalError } from "./errors";
import { LOW_ROW_RESULTS } from "./rowResults";

export default function analyzeLow(row: Signal[]) {
  const [left, middle, right, totalSignal] = getRowMetrics(row);

  if (totalSignal < MINIMUM_ROW_SIGNAL) {
    throw new LowSignalError(row, totalSignal);
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

  throw new UnclassifiedSignalError(row);
}
