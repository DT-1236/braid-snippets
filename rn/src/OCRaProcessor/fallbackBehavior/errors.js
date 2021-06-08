/** @flow */
import type { Signal, CoordinateKey, NumberSamples } from "../ocrConfig";

export class OcrError extends Error {}

export class OcrException extends Error {}

// Indicates the signal in a row is invalid or cannot be evaluated conclusively.
// This should forego further processing and be sent to Bugsnag along with
// the card id
export class InvalidNumberSampleError extends OcrError {
  coordinateKey: ?CoordinateKey;
  samples: NumberSamples;
}

// Indicates that the number signature (comprised of top, middle, and low rows) could not be evaluated conclusively.
// Three of these for the same number samples should constitute a halting SignatureInterpretationError
export class SignatureInterpretationException extends OcrException {
  offset: number;
  samples: NumberSamples;
}

export function logNewSignature(
  signatureRepr: string,
  result: number,
  offset: number,
  interpretationExceptions: SignatureInterpretationException[]
) {
  console.log(
    `Encountered an unexpected number signature:\n${signatureRepr}\n` +
      `was interpreted as: ${result} with an offset of ${offset}` +
      (interpretationExceptions.length
        ? `\nInterpretation Exceptions:${interpretationExceptions.toString()}`
        : "")
  );
}

export class InvalidPanError extends OcrError {
  constructor(panString: string) {
    super(`Invalid PAN result - ${panString}`);
  }
}

export class NewSignatureException extends OcrException {
  constructor(cardId: string) {
    super(
      `New number signature(s) successfully interpreted for cardId: ${cardId}.`
    );
  }
}

export class FailedInterpretationError extends OcrError {
  constructor(cardId: string, errors: (Error | null)[]) {
    super(
      `Unable to interpret card information for cardId: ${cardId}\n${errors
        .map((e) => (e ? e.toString() : ""))
        .join("\n")}`
    );
  }
}

export class SequenceRecognitionError extends OcrError {
  interpretationErrors: SignatureInterpretationError[];
  samplingErrors: InvalidNumberSampleError[];
  constructor(
    interpretationErrors: SignatureInterpretationError[] = [],
    samplingErrors: InvalidNumberSampleError[] = []
  ) {
    const interpretationErrorKeys = interpretationErrors.map(
      (e) => e.coordinateKey
    );
    const sampleErrorKeys = samplingErrors.map((f) => f.coordinateKey);
    const keys = interpretationErrorKeys.concat(sampleErrorKeys);
    super(`locations - ${keys.join(", ")} `);
    this.interpretationErrors = interpretationErrors;
    this.samplingErrors = samplingErrors;
  }
}

export class SignatureInterpretationError extends OcrError {
  interpretationExceptions: SignatureInterpretationException[];
  coordinateKey: CoordinateKey;
  samples: NumberSamples;
  constructor(
    interpretationExceptions: SignatureInterpretationException[],
    samples: NumberSamples,
    coordinateKey: CoordinateKey
  ) {
    super("OCR processor was unable to interpret a number signature");
    this.interpretationExceptions = interpretationExceptions;
    this.samples = samples;
    this.coordinateKey = this.coordinateKey;
  }
}

export class LowSignalError extends InvalidNumberSampleError {
  constructor(row: Signal[], total: number) {
    super(`Signal for row was unexpectedly low: ${total}\n${row.toString()}`);
  }
}

export class UnclassifiedSignalError extends InvalidNumberSampleError {
  constructor(row: Signal[]) {
    super(
      `Signal was detected in the row, but the processor did not classify it as left, middle, or right in nature\n` +
        row.toString()
    );
  }
}

export class InconclusiveMiddleRowEvaluationError extends InvalidNumberSampleError {
  constructor(row: Signal[], left: boolean, middle: boolean, right: boolean) {
    super(
      `Unexpected results for middle row evaluation\n${row.toString()}\n` +
        `Left: ${left.toString()}\nMiddle: ${middle.toString()}\nRight: ${right.toString()}`
    );
  }
}

export class MiddleRowHighSignalError extends InvalidNumberSampleError {
  constructor(row: Signal[], total: number) {
    super(
      `Signal for middle row was unexpectedly high: ${total}\n${row.toString()}`
    );
  }
}
