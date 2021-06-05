/** @flow */
import getRowMetrics from "./getRowMetrics";
import { type Signal, POSITIVE_SIGNAL } from "../ocrConfig";
export const MIDDLE_ROW_RESULTS = {
  LEFT: "LEFT",
  RIGHT: "RIGHT",
  MIDDLE: "MIDDLE",
  LEFT_AND_RIGHT: "LEFT_AND_RIGHT",
  EIGHT: "EIGHT",
};

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
    throw new Error(
      `Signal for middle row was unexpectedly high: ${total}\n${row.toString()}`
    );
  }

  if (middle) {
    if (left && !right && total < 4) {
      // a 5 shifted to the right can register as middle
      return MIDDLE_ROW_RESULTS.LEFT;
    }
    if (left || right) {
      throw new Error(
        `Unexpected results for middle row evaluation\nLeft: ${left.toString()}\nMiddle: ${middle.toString()}\nRight: ${right.toString()}`
      );
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
  throw new Error(
    `Somehow minimum signal was met for middle row evaluation, but results were inconclusive`
  );
}
