/** @flow */
import luhn from "luhn";
import getNumberSamples from "./getNumberSamples";
import {
  PAN_COORDINATES,
  MONTH_COORDINATES,
  YEAR_COORDINATES,
  CVV_COORDINATES,
} from "./ocrConfig";
import expectedNumberSignatures from "./expectedNumberSignatures";
import interpretUnexpectedNumberSamples from "./fallbackBehavior/interpretUnexpectedNumberSamples";
import { redPixelDataFromUrl } from "./jpegProcessor";

/**
 * The jpeg data from the image is decoded into an array of pixel data.
 * The pixel data is trimmed down to only red pixel data for simplicity
 * since numbers are displayed in greyscale meaning rgb values are identical.
 * Known coordinates are sampled (3 rows taken from 16x16 areas containing important
 * nunbers). The samples are then evaluated to determine the numbers they represent.
 */
export async function getPanExpAndCvv(url: string) {
  const redPixelData = await redPixelDataFromUrl(url);
  return {
    expMonth: getMonth(redPixelData),
    expYear: getYear(redPixelData),
    cvv: getCvv(redPixelData),
    pan: getPan(redPixelData),
  };
}

function recognizeNumber(coordinates, redPixelData: number[]) {
  return coordinates.reduce(function recognizeNumberReducer(
    acc,
    [x, y, coordKey]
  ) {
    const rows = getNumberSamples(x, y, redPixelData);
    const signature = rows.map((row) => row.join("")).join("");
    const memo = expectedNumberSignatures[signature];
    if (typeof memo === "number") {
      return acc + memo;
    }
    return acc + interpretUnexpectedNumberSamples(rows, coordKey) ?? "";
  },
  "");
}

function getPan(redPixelData: number[]) {
  const pan = recognizeNumber(PAN_COORDINATES, redPixelData);
  if (!luhn.validate(pan)) {
    throw new Error(`Resulted in an invalid PAN: ${printPan(pan)}`);
  }
  return pan;
}

function getMonth(redPixelData: number[]) {
  return recognizeNumber(MONTH_COORDINATES, redPixelData);
}

function getYear(redPixelData: number[]) {
  return recognizeNumber(YEAR_COORDINATES, redPixelData);
}

function getCvv(redPixelData: number[]) {
  return recognizeNumber(CVV_COORDINATES, redPixelData);
}

export function printPan(pan: string) {
  return `${pan.slice(0, 4)} ${pan.slice(4, 8)} ${pan.slice(8, 12)} ${pan.slice(
    12
  )}`;
}
