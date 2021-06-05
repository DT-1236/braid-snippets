/** @flow */

import { MINIMUM_ROW_SIGNAL, type Signal, POSITIVE_SIGNAL } from "../ocrConfig";

const TOP_THIN_THRESHOLD = 4;
const TOP_WIDE_THRESHOLD = 7;
export const TOP_ROW_RESULTS = {
  THIN: "THIN",
  WIDE: "WIDE",
  MEDIUM: "MEDIUM",
};
export default function analyzeTop(row: Signal[]) {
  const result = row.filter((p) => p === POSITIVE_SIGNAL).length;
  if (result < TOP_THIN_THRESHOLD) {
    return TOP_ROW_RESULTS.THIN;
  }
  if (result > TOP_WIDE_THRESHOLD) {
    return TOP_ROW_RESULTS.WIDE;
  }
  if (result < MINIMUM_ROW_SIGNAL) {
    throw new Error(`Signal for top row was unexpectedly low: ${result}`);
  }
  return TOP_ROW_RESULTS.MEDIUM;
}
