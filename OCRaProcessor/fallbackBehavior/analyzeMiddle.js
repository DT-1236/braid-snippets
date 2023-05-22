/** @flow */
import getRowMetrics from "./getRowMetrics";
import { type Signal, POSITIVE_SIGNAL } from "../ocrConfig";
import {
  InconclusiveMiddleRowEvaluationError,
  MiddleRowHighSignalError,
  UnclassifiedSignalError,
} from "./errors";
import { MIDDLE_ROW_RESULTS } from "./rowResults";

const MIDDLE_MAX_EIGHT_OFFSET = 5;
function checkForMiddleEightPattern(middleRow) {
  let indicesSinceLastPositive = null;
  let signal;
  for (let i = 0; i < middleRow.length; i++) {
    signal = middleRow[i] === POSITIVE_SIGNAL;
    if (!signal) {
      if (indicesSinceLastPositive !== null) {
        indicesSinceLastPositive++;
      }
      continue;
    }

    if (
      indicesSinceLastPositive &&
      indicesSinceLastPositive < MIDDLE_MAX_EIGHT_OFFSET
    ) {
      return true;
    }

    indicesSinceLastPositive = 0;
  }
  return false;
}

const MIDDLE_MAXIMUM_SIGNAL = 6;
export default function analyzeMiddle(row: Signal[]) {
  if (checkForMiddleEightPattern(row)) {
    return MIDDLE_ROW_RESULTS.EIGHT;
  }

  const [left, middle, right, total] = getRowMetrics(row);

  if (total > MIDDLE_MAXIMUM_SIGNAL) {
    throw new MiddleRowHighSignalError(row, total);
  }

  if (middle) {
    if (left && !right && total < 4) {
      // a 5 shifted to the right can register as having a middle signal pattern distribution
      return MIDDLE_ROW_RESULTS.LEFT;
    }
    if (left || right) {
      throw new InconclusiveMiddleRowEvaluationError(row, left, middle, right);
    }
    return MIDDLE_ROW_RESULTS.MIDDLE;
  }

  if (left) {
    if (right) {
      return MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT;
    }
    return MIDDLE_ROW_RESULTS.LEFT;
  }
  if (right) {
    return MIDDLE_ROW_RESULTS.RIGHT;
  }
  throw new UnclassifiedSignalError(row);
}
