/** @flow */

import {
  NEGATIVE_SIGNAL,
  POSITIVE_SIGNAL,
  SIGNAL_THRESHOLD,
  OCRAD_CHAR_WIDTH,
  type Signal,
  type NumberSamples,
} from "./ocrConfig";

function interpretPixelData(redPixelInput: number) {
  return redPixelInput < SIGNAL_THRESHOLD ? POSITIVE_SIGNAL : NEGATIVE_SIGNAL;
}

function getNumberRow(startIndex, redPixelData: number[]) {
  return redPixelData
    .slice(startIndex, startIndex + OCRAD_CHAR_WIDTH)
    .map<Signal>(interpretPixelData);
}

const SECOND_LINE_OFFSET = 4;
const THIRD_LINE_OFFSET = 13;
const VIRTUAL_CARD_DATA_IMAGE_WIDTH = 500;
// const VIRTUAL_CARD_DATA_IMAGE_HEIGHT = 315;
export default function getNumberSamples(
  x: number,
  y: number,
  redPixelData: number[]
): NumberSamples {
  const firstStart = y * VIRTUAL_CARD_DATA_IMAGE_WIDTH + x;
  const secondStart =
    (y + SECOND_LINE_OFFSET) * VIRTUAL_CARD_DATA_IMAGE_WIDTH + x;
  const thirdStart =
    (y + THIRD_LINE_OFFSET) * VIRTUAL_CARD_DATA_IMAGE_WIDTH + x;
  return [
    getNumberRow(firstStart, redPixelData),
    getNumberRow(secondStart, redPixelData),
    getNumberRow(thirdStart, redPixelData),
  ];
}
