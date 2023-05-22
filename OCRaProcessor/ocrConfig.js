/** @flow */

// Signals range from 130 to 255. About halfway is 193.
// After reviewing signals from about 200 numbers,
// ~60% of signals that aren't 255 are 131. Strangely,
// about ~15% of signaals are 232, but that seems somewhat high (too close to white)
// to be considered a positive signal.
export const SIGNAL_THRESHOLD = 193;
export const OCRAD_CHAR_WIDTH = 16;
export const MINIMUM_ROW_SIGNAL = 2;
export const POSITIVE_SIGNAL = 1;
export const NEGATIVE_SIGNAL = 0;

export type Signal = typeof POSITIVE_SIGNAL | typeof NEGATIVE_SIGNAL;
export type NumberSamples = [Signal[], Signal[], Signal[]];

export type CoordinateKey = $Keys<typeof COORD_KEYS>;

export const COORD_KEYS = {
  Pan0: "Pan0",
  Pan1: "Pan1",
  Pan2: "Pan2",
  Pan3: "Pan3",
  Pan4: "Pan4",
  Pan5: "Pan5",
  Pan6: "Pan6",
  Pan7: "Pan7",
  Pan8: "Pan8",
  Pan9: "Pan9",
  Pan10: "Pan10",
  Pan11: "Pan11",
  Pan12: "Pan12",
  Pan13: "Pan13",
  Pan14: "Pan14",
  Pan15: "Pan15",
  Month0: "Month0",
  Month1: "Month1",
  Year0: "Year0",
  Year1: "Year1",
  Cvv0: "Cvv0",
  Cvv1: "Cvv1",
  Cvv2: "Cvv2",
};

type CoordinateSet = [number, number, CoordinateKey];

export const PAN_COORDINATES: CoordinateSet[] = [
  [29, 101, COORD_KEYS.Pan0],
  [45, 101, COORD_KEYS.Pan1],
  [61, 101, COORD_KEYS.Pan2],
  [77, 101, COORD_KEYS.Pan3],
  [127, 101, COORD_KEYS.Pan4],
  [143, 101, COORD_KEYS.Pan5],
  [159, 101, COORD_KEYS.Pan6],
  [175, 101, COORD_KEYS.Pan7],
  [226, 101, COORD_KEYS.Pan8],
  [242, 101, COORD_KEYS.Pan9],
  [258, 101, COORD_KEYS.Pan10],
  [274, 101, COORD_KEYS.Pan11],
  [324, 101, COORD_KEYS.Pan12],
  [340, 101, COORD_KEYS.Pan13],
  [356, 101, COORD_KEYS.Pan14],
  [372, 101, COORD_KEYS.Pan15],
];

export const MONTH_COORDINATES: CoordinateSet[] = [
  [29, 245, COORD_KEYS.Month0],
  [45, 245, COORD_KEYS.Month1],
];
// [61, 245],// +/- 1
export const YEAR_COORDINATES: CoordinateSet[] = [
  [77, 245, COORD_KEYS.Year0],
  [93, 245, COORD_KEYS.Year1],
];

export const CVV_COORDINATES: CoordinateSet[] = [
  [149, 245, COORD_KEYS.Cvv0],
  [165, 245, COORD_KEYS.Cvv1],
  [181, 245, COORD_KEYS.Cvv2],
];
