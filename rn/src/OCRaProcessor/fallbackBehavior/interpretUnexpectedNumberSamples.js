/** @flow */

import analyzeMiddle, { MIDDLE_ROW_RESULTS } from "./analyzeMiddle";
import analyzeLow, { LOW_ROW_RESULTS } from "./analyzeLow";
import analyzeTop, { TOP_ROW_RESULTS } from "./analyzeTop";
import { type NumberSamples, type CoordinateKey } from "../ocrConfig";
import Bugsnag from "../../Bugsnag";
import shiftNumberSample from "../shiftNumberSample";

/**
 * This should rarely, if ever, be used. It will attempt to evaluate
 * samples with the same logic used to populate expectedNumberSignatures.js.
 * It will also shift the samples 0-2 spaces to the right to increase
 * chances of identification.
 */
export default function interpretUnexpectedNumberSamples(
  rows: NumberSamples,
  coordKey: CoordinateKey
): number {
  const errors = [];
  const signatureRepr = rows.map((r) => r.join("")).join("\n");
  for (let offset = 0; offset < 3; offset++) {
    try {
      const result = interpretNumberSamples(rows, offset);
      const bugSnagMsg =
        `Encountered an unexpected number signature:\n${signatureRepr}\nwas interpreted as: ${result} with an offset of ${offset}` +
        errors.length
          ? `\nFailed interpretations:${errors.toString()}`
          : "";
      Bugsnag.notify(new Error(bugSnagMsg));
      return result;
    } catch (ex) {
      errors.push(ex);
    }
  }

  throw new Error(
    `Unable to interpret number signature at ${coordKey}\n${signatureRepr}\nInterpretation results:${errors.toString()}`
  );
}

function interpretNumberSamples(rows, offset = 0) {
  const top = analyzeTop(shiftNumberSample(rows[0], offset));
  const mid = analyzeMiddle(shiftNumberSample(rows[1], offset));
  const low = analyzeLow(shiftNumberSample(rows[2], offset));
  if (low === LOW_ROW_RESULTS.WIDE) {
    // expect 6. Only a 6 can be this wide at this level, though the sampled low row may also result in left/right
    if (top !== TOP_ROW_RESULTS.THIN || mid !== MIDDLE_ROW_RESULTS.LEFT) {
      throw new Error(
        `Results inconclusive. Low result anticipates 6, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 6;
  }

  if (low === LOW_ROW_RESULTS.MIDDLE_AND_RIGHT) {
    // expect 1
    if (top !== TOP_ROW_RESULTS.MEDIUM || mid !== MIDDLE_ROW_RESULTS.MIDDLE) {
      throw new Error(
        `Results inconclusive. Low result anticipates 1, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 1;
  }

  if (low === LOW_ROW_RESULTS.MIDDLE) {
    // expect 7
    if (top !== TOP_ROW_RESULTS.WIDE || mid !== MIDDLE_ROW_RESULTS.RIGHT) {
      throw new Error(
        `Results inconclusive. Low result anticipates 7, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 7;
  }

  if (low === LOW_ROW_RESULTS.LEFT) {
    // expect 2
    if (top !== TOP_ROW_RESULTS.WIDE || mid !== MIDDLE_ROW_RESULTS.RIGHT) {
      throw new Error(
        `Results inconclusive. Low result anticipates 2, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 2;
  }

  if (low === LOW_ROW_RESULTS.LEFT_AND_RIGHT) {
    // expect 6, 8, or 0
    if (top === TOP_ROW_RESULTS.MEDIUM) {
      if (mid !== MIDDLE_ROW_RESULTS.EIGHT) {
        throw new Error(
          `Results inconclusive. Low/Top result anticipates 8, however, Middle: ${mid}`
        );
      }
      return 8;
    }
    if (mid === MIDDLE_ROW_RESULTS.LEFT) {
      // Only 6 has only a left signal in the middle
      if (top !== TOP_ROW_RESULTS.THIN) {
        throw new Error(
          `Results inconclusive. Low/Mid result anticipates 6, however, Top: ${top}`
        );
      }
      return 6;
    }
    if (
      top !== TOP_ROW_RESULTS.WIDE ||
      mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT
    ) {
      throw new Error(
        `Results inconclusive. Low result of ${low} suggests 6/8/0 and 6 and 8 have been excluded. Expected 0, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 0;
  }

  if (low === LOW_ROW_RESULTS.RIGHT) {
    // expect 3, 4, 5, or 9
    if (mid === MIDDLE_ROW_RESULTS.RIGHT) {
      // expect 3
      if (top !== TOP_ROW_RESULTS.WIDE) {
        throw new Error(
          `Results inconclusive. Low: ${low}, Mid: ${mid} suggests 3, but Top: ${top}`
        );
      }
      return 3;
    }
    if (mid === MIDDLE_ROW_RESULTS.LEFT) {
      // expect 5
      if (top !== TOP_ROW_RESULTS.WIDE) {
        throw new Error(
          `Results inconclusive. Low: ${low}, Mid: ${mid} suggests 5, but Top: ${top}`
        );
      }
      return 5;
    }
    if (top === TOP_ROW_RESULTS.THIN) {
      // expect 4
      if (mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT) {
        throw new Error(
          `Results inconclusive. Low: ${low}, Top: ${top} suggests 4, but Mid: ${mid}`
        );
      }
      return 4;
    }
    if (top === TOP_ROW_RESULTS.WIDE) {
      if (mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT) {
        throw new Error(
          `Results inconclusive. Low: ${low}, Top: ${top} suggests 9, but Mid: ${mid}`
        );
      }
      return 9;
    }
  }
  throw new Error(
    `Results are entirely inconclusive. Low: ${low}, Top: ${top}, Mid: ${mid}`
  );
}
