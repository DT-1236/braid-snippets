/** @flow */
import { OCRAD_CHAR_WIDTH, type Signal, NEGATIVE_SIGNAL } from "./ocrConfig";

export default function shiftNumberSample(
  row: Signal[],
  offset?: number = 0
): Signal[] {
  const signalOffset: Signal[] = [];
  for (let i = 0; i < offset; i++) {
    signalOffset.push(NEGATIVE_SIGNAL);
  }
  // If the original row isn't copied like this, it is concatenated as a Buffer,
  // which is quite different from an array and produces unexpected behavior.
  return signalOffset.concat([...row.slice(0, OCRAD_CHAR_WIDTH - offset)]);
}

const NEGATIVE_SIGNAL_STRING = NEGATIVE_SIGNAL.toString();
export function shiftSignature(signature: string, offset?: number = 0) {
  return (
    NEGATIVE_SIGNAL_STRING.repeat(offset) +
    signature.slice(0, OCRAD_CHAR_WIDTH - offset)
  );
}
