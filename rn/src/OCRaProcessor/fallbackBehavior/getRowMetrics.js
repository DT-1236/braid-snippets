/** @flow */

import { MINIMUM_ROW_SIGNAL, type Signal, POSITIVE_SIGNAL } from "../ocrConfig";
import { LowSignalError } from "./errors";

const ROW_LEFT_INDEX = 6;
const ROW_RIGHT_INDEX = 9;

export default function getRowMetrics(row: Signal[]) {
  let left = false;
  let right = false;
  let middle = false;
  let totalSignal = 0;
  let signal;
  for (let i = 0; i < row.length; i++) {
    signal = row[i] === POSITIVE_SIGNAL;
    if (!signal) {
      continue;
    }

    if (i < ROW_LEFT_INDEX) {
      left = true;
    } else if (i > ROW_RIGHT_INDEX) {
      right = true;
    } else {
      middle = true;
    }
    totalSignal++;
  }

  if (totalSignal < MINIMUM_ROW_SIGNAL) {
    throw new LowSignalError(row, totalSignal);
  }
  return [left, middle, right, totalSignal];
}
