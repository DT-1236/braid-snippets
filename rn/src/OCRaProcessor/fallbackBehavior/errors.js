/** @flow */
import type { Signal, CoordinateKey, NumberSamples } from "../ocrConfig";

export class OcrError extends Error {}

export class OcrException extends Error {}

// Indicates the signal in a row is invalid or cannot be evaluated conclusively.
// This should forego further processing and be sent to Bugsnag along with
// the card id
export class InvalidNumberSampleError extends OcrError {}

// Indicates that the number signature (comprised of top, middle, and low rows) could not be evaluated conclusively.
export class SignatureInterpretationException extends OcrException {}

// Logs a successful interpretation of a new signature. Mostly useful when
// manually debugging/troubleshooting after being alerted by Bugsnag
export function logNewSignature(
  signatureRepr: string,
  result: number,
  offset: number,
  interpretationFailures: SignatureInterpretationException[]
) {
  console.log(
    `Encountered an unexpected number signature:\n${signatureRepr}\n` +
      `was interpreted as: ${result} with an offset of ${offset}` +
      interpretationFailures.length
      ? `\nFailed interpretations:${interpretationFailures.toString()}`
      : ""
  );
}

export class NewSignatureException extends OcrException {
  constructor(cardId: string) {
    super(
      `New number signature(s) successfully interpreted for cardId: ${cardId}.`
    );
  }
}

export class FailedInterpretationError extends OcrError {
  constructor(cardId: string, exception: any) {
    super(
      `Unable to interpret card information for cardId: ${cardId}\n${exception.toString()}`
    );
  }
}

// Indicates that the signature interpretation failed despite shifting the number frame.
// It is thrown somewhat deep in the OCR process and should be further processed
// and sent to Bugsnag when more context is available.
export class SignatureInterpretationError extends OcrError {
  interpretationFailures: SignatureInterpretationException[];
  constructor(interpretationFailures: SignatureInterpretationException[]) {
    super("OCR processor was unable to interpret a number signature");
    this.interpretationFailures = interpretationFailures;
  }
}

export class FailedInterpretation {
  key: CoordinateKey;
  samples: NumberSamples;
  failures: SignatureInterpretationException[];
  constructor(
    coordinateKey: CoordinateKey,
    rows: NumberSamples,
    ex: SignatureInterpretationError
  ) {
    this.key = coordinateKey;
    this.samples = rows;
    this.failures = ex.interpretationFailures;
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
