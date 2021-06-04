/** @flow */
import { shiftSignature } from "./shiftNumberSample";

// The signatures in the number profile represent the left-most alignment
// of the number. For example, zero:
// 0000000000000000
// 0001111111110000 ***
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000 ***
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000
// 0011000000011000 ***
// 0001111111110000
// 0000000000000000
// The rows with asterisks are the sampled rows.

// Although the profiles only have one signature at this time, there may be
// a case where multiple signatures are recognized, eg - a zero where the top
// is one pixel wider. The actual expected signatures mapping includes the
// signatures shown here as well as signatures shifted to the right by one
// and two pixels.
const zero = [["0001111111110000", "0011000000011000", "0011000000011000"]];
const one = [["0011111100000000", "0000001100000000", "0000001100011000"]];
const two = [["0011111111110000", "0000000000011000", "0011000000000000"]];
const three = [["0011111111110000", "0000000000011000", "0000000000011000"]];
const four = [["0001100000000000", "0001100000110000", "0000000000110000"]];
const five = [["0001111111110000", "0001100000000000", "0000000000110000"]];
const six = [["0011100000000000", "0011000000000000", "0011000000011000"]];
const seven = [["0011111111111000", "0000000000011000", "0000001100000000"]];
const eight = [["0000111111100000", "0000110001100000", "0011000000011000"]];
const nine = [["0011111111111000", "0011000000011000", "0000000000011000"]];

// A number profile is defined here as the collection of signatures
// that correspond to that number. Other methods depend on the index of the
// number profile matching the numerical value that profile represents.
export const numberProfiles = [
  zero,
  one,
  two,
  three,
  four,
  five,
  six,
  seven,
  eight,
  nine,
];

export default numberProfiles.reduce((acc, signatures, idx) => {
  signatures.forEach((signature) => {
    const leftMostAlignmentSignature = signature.join("");
    const middleAlignmentSignature = signature
      .map((r) => shiftSignature(r, 1))
      .join("");
    const rightMostAlignmentSignature = signature
      .map((r) => shiftSignature(r, 2))
      .join("");
    acc[leftMostAlignmentSignature] = idx;
    acc[middleAlignmentSignature] = idx;
    acc[rightMostAlignmentSignature] = idx;
  });
  return acc;
}, {});
