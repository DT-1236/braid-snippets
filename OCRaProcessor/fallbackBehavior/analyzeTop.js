/** @flow */

import { MINIMUM_ROW_SIGNAL, type Signal, POSITIVE_SIGNAL } from "../ocrConfig";
import { LowSignalError } from "./errors";
import { TOP_ROW_RESULTS } from "./rowResults";

const TOP_THIN_THRESHOLD = 4;
const TOP_WIDE_THRESHOLD = 7;
export default function analyzeTop(row: Signal[]) {
  const totalSignal = row.filter((p) => p === POSITIVE_SIGNAL).length;
  if (totalSignal < TOP_THIN_THRESHOLD) {
    return TOP_ROW_RESULTS.THIN;
  }
  if (totalSignal > TOP_WIDE_THRESHOLD) {
    return TOP_ROW_RESULTS.WIDE;
  }
  if (totalSignal < MINIMUM_ROW_SIGNAL) {
    throw new LowSignalError(row, totalSignal);
  }
  return TOP_ROW_RESULTS.MEDIUM;
}
