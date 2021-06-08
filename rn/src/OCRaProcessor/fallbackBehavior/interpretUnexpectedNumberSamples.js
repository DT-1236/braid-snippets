/** @flow */

import analyzeMiddle from "./analyzeMiddle";
import analyzeLow from "./analyzeLow";
import analyzeTop from "./analyzeTop";
import {
  MIDDLE_ROW_RESULTS,
  LOW_ROW_RESULTS,
  TOP_ROW_RESULTS,
} from "./rowResults";
import { type NumberSamples, type CoordinateKey } from "../ocrConfig";
import shiftNumberSample from "../shiftNumberSample";
import {
  logNewSignature,
  SignatureInterpretationError,
  SignatureInterpretationException,
} from "./errors";
import { signatureRepr } from "../getNumberSamples";

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
  const interpretationFailures = [];
  for (let offset = 0; offset < 3; offset++) {
    try {
      const result = interpretNumberSamples(rows, offset);
      logNewSignature(
        signatureRepr(rows),
        result,
        offset,
        interpretationFailures
      );
      return result;
    } catch (ex) {
      if (ex instanceof SignatureInterpretationException) {
        interpretationFailures.push(ex);
      } else {
        // Entirely unexpected and should be handled by top-level bugsnag
        throw ex;
      }
    }
  }

  throw new SignatureInterpretationError(interpretationFailures);
}

function interpretNumberSamples(rows, offset = 0) {
  const top = analyzeTop(shiftNumberSample(rows[0], offset));
  const mid = analyzeMiddle(shiftNumberSample(rows[1], offset));
  const low = analyzeLow(shiftNumberSample(rows[2], offset));
  if (low === LOW_ROW_RESULTS.WIDE) {
    // expect 6. Only a 6 can be this wide at this level, though the sampled low row may also result in left/right
    if (top !== TOP_ROW_RESULTS.THIN || mid !== MIDDLE_ROW_RESULTS.LEFT) {
      throw new SignatureInterpretationException(
        `Low result anticipates 6, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 6;
  }

  if (low === LOW_ROW_RESULTS.MIDDLE_AND_RIGHT) {
    // expect 1
    if (top !== TOP_ROW_RESULTS.MEDIUM || mid !== MIDDLE_ROW_RESULTS.MIDDLE) {
      throw new SignatureInterpretationException(
        `Low result anticipates 1, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 1;
  }

  if (low === LOW_ROW_RESULTS.MIDDLE) {
    // expect 7
    if (top !== TOP_ROW_RESULTS.WIDE || mid !== MIDDLE_ROW_RESULTS.RIGHT) {
      throw new SignatureInterpretationException(
        `Low result anticipates 7, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 7;
  }

  if (low === LOW_ROW_RESULTS.LEFT) {
    // expect 2
    if (top !== TOP_ROW_RESULTS.WIDE || mid !== MIDDLE_ROW_RESULTS.RIGHT) {
      throw new SignatureInterpretationException(
        `Low result anticipates 2, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 2;
  }

  if (low === LOW_ROW_RESULTS.LEFT_AND_RIGHT) {
    // expect 6, 8, or 0
    if (top === TOP_ROW_RESULTS.MEDIUM) {
      if (mid !== MIDDLE_ROW_RESULTS.EIGHT) {
        throw new SignatureInterpretationException(
          `Low/Top result anticipates 8, however, Middle: ${mid}`
        );
      }
      return 8;
    }
    if (mid === MIDDLE_ROW_RESULTS.LEFT) {
      // Only 6 has only a left signal in the middle
      if (top !== TOP_ROW_RESULTS.THIN) {
        throw new SignatureInterpretationException(
          `Low/Mid result anticipates 6, however, Top: ${top}`
        );
      }
      return 6;
    }
    if (
      top !== TOP_ROW_RESULTS.WIDE ||
      mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT
    ) {
      throw new SignatureInterpretationException(
        `Low result of ${low} suggests 6/8/0 and 6 and 8 have been excluded. Expected 0, however Top: ${top}, Middle: ${mid}`
      );
    }
    return 0;
  }

  if (low === LOW_ROW_RESULTS.RIGHT) {
    // expect 3, 4, 5, or 9
    if (mid === MIDDLE_ROW_RESULTS.RIGHT) {
      // expect 3
      if (top !== TOP_ROW_RESULTS.WIDE) {
        throw new SignatureInterpretationException(
          `Low: ${low}, Mid: ${mid} suggests 3, but Top: ${top}`
        );
      }
      return 3;
    }
    if (mid === MIDDLE_ROW_RESULTS.LEFT) {
      // expect 5
      if (top !== TOP_ROW_RESULTS.WIDE) {
        throw new SignatureInterpretationException(
          `Low: ${low}, Mid: ${mid} suggests 5, but Top: ${top}`
        );
      }
      return 5;
    }
    if (top === TOP_ROW_RESULTS.THIN) {
      // expect 4
      if (mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT) {
        throw new SignatureInterpretationException(
          `Low: ${low}, Top: ${top} suggests 4, but Mid: ${mid}`
        );
      }
      return 4;
    }
    if (top === TOP_ROW_RESULTS.WIDE) {
      if (mid !== MIDDLE_ROW_RESULTS.LEFT_AND_RIGHT) {
        throw new SignatureInterpretationException(
          `Low: ${low}, Top: ${top} suggests 9, but Mid: ${mid}`
        );
      }
      return 9;
    }
  }
  throw new SignatureInterpretationException(
    `Results are entirely inconclusive. Low: ${low}, Top: ${top}, Mid: ${mid}`
  );
}
