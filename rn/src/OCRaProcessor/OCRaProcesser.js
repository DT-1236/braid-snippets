/** @flow */
import luhn from "luhn";
import Bugsnag from "../Bugsnag";
import getNumberSamples from "./getNumberSamples";
import {
  PAN_COORDINATES,
  MONTH_COORDINATES,
  YEAR_COORDINATES,
  CVV_COORDINATES,
} from "./ocrConfig";
import expectedNumberSignatures from "./expectedNumberSignatures";
import interpretUnexpectedNumberSamples from "./fallbackBehavior/interpretUnexpectedNumberSamples";
import { redPixelDataFromPath, redPixelDataFromUrl } from "./jpegProcessor";
import {
  FailedInterpretation,
  FailedInterpretationError,
  InvalidNumberSampleError,
  NewSignatureException,
  SignatureInterpretationError,
} from "./fallbackBehavior/errors";

/**
 * The jpeg data from the image is decoded into an array of pixel data.
 * The pixel data is trimmed down to only red pixel data for simplicity
 * since numbers are displayed in greyscale meaning rgb values are identical.
 * Known coordinates are sampled (3 rows taken from 16x16 areas containing important
 * nunbers). The samples are then evaluated to determine the numbers they represent.
 */
export async function getPanExpAndCvv(url: string, cardId: string) {
  try {
    const redPixelData = await redPixelDataFromUrl(url);
    const [expMonth, monthHasNewSignature] = getMonth(redPixelData);
    const [expYear, yearHasNewSignature] = getYear(redPixelData);
    const [cvv, cvvHasNewSignature] = getCvv(redPixelData);
    const [pan, panHasNewSignature] = getPan(redPixelData);

    const newSignatureSeen = [
      monthHasNewSignature,
      yearHasNewSignature,
      cvvHasNewSignature,
      panHasNewSignature,
    ].some((b) => b);

    if (newSignatureSeen) {
      Bugsnag.notify(new NewSignatureException(cardId));
    }

    return {
      expMonth,
      expYear,
      cvv,
      pan,
    };
  } catch (ex) {
    Bugsnag.notify(new FailedInterpretationError(cardId, ex));
  }
}

export async function getPanExpAndCvvFromPath(path: string) {
  const redPixelData = await redPixelDataFromPath(path);
  return {
    expMonth: getMonth(redPixelData),
    expYear: getYear(redPixelData),
    cvv: getCvv(redPixelData),
    pan: getPan(redPixelData),
  };
}

function recognizeSequence(coordinates, redPixelData: number[]) {
  const failedInterpretations = [];
  let newSignature = false;
  const sequence = coordinates.reduce(function recognizeNumberReducer(
    acc,
    [x, y, coordKey]
  ) {
    const rows = getNumberSamples(x, y, redPixelData);
    const signature = rows.map((row) => row.join("")).join("");
    const memo = expectedNumberSignatures[signature];
    if (typeof memo === "number") {
      return acc + memo;
    }
    newSignature = true;

    let result = "";
    try {
      result = interpretUnexpectedNumberSamples(rows, coordKey);
    } catch (ex) {
      if (ex instanceof SignatureInterpretationError) {
        failedInterpretations.push(
          new FailedInterpretation(coordKey, rows, ex)
        );
      } else if (ex instanceof InvalidNumberSampleError) {
        throw ex;
      } else {
        throw ex;
      }
    }

    return acc + result;
  },
  "");
  return [sequence, newSignature];
}

function getPan(redPixelData: number[]) {
  const [pan, panHasNewSignature] = recognizeSequence(
    PAN_COORDINATES,
    redPixelData
  );
  if (!luhn.validate(pan)) {
    throw new Error(`Resulted in an invalid PAN: ${printPan(pan)}`);
  }
  return [pan, panHasNewSignature];
}

function getMonth(redPixelData: number[]) {
  return recognizeSequence(MONTH_COORDINATES, redPixelData);
}

function getYear(redPixelData: number[]) {
  return recognizeSequence(YEAR_COORDINATES, redPixelData);
}

function getCvv(redPixelData: number[]) {
  return recognizeSequence(CVV_COORDINATES, redPixelData);
}

export function printPan(pan: string) {
  return `${pan.slice(0, 4)} ${pan.slice(4, 8)} ${pan.slice(8, 12)} ${pan.slice(
    12
  )}`;
}
