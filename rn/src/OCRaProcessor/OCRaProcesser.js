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
import { redPixelDataFromUrl } from "./jpegProcessor";
import {
  FailedInterpretationError,
  InvalidNumberSampleError,
  InvalidPanError,
  NewSignatureException,
  SequenceRecognitionError,
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
  const redPixelData = await redPixelDataFromUrl(url);
  const [expMonth, monthHasNewSignature, monthError] = getMonth(redPixelData);
  const [expYear, yearHasNewSignature, yearError] = getYear(redPixelData);
  const [cvv, cvvHasNewSignature, cvvError] = getCvv(redPixelData);
  const [pan, panHasNewSignature, panError] = getPan(redPixelData);

  const newSignatureSeen = [
    monthHasNewSignature,
    yearHasNewSignature,
    cvvHasNewSignature,
    panHasNewSignature,
  ].some((b) => b);

  if (newSignatureSeen) {
    Bugsnag.notify(new NewSignatureException(cardId));
  }

  const errors = [monthError, yearError, cvvError, panError].filter((e) => e);
  if (errors.length) {
    // ex.interpretationErrors should have results and locations of signature interpretation errors
    // ex.samplingErrors should have locations and samples of nunmber sampling errors
    throw new FailedInterpretationError(cardId, errors);
  }

  return {
    expMonth,
    expYear,
    cvv,
    pan,
  };
}

function recognizeSequence(coordinates, redPixelData: number[]) {
  const interpretationErrors = [];
  const samplingErrors = [];
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
        ex.coordinateKey = coordKey;
        ex.samples = rows;
        interpretationErrors.push(ex);
      } else if (ex instanceof InvalidNumberSampleError) {
        ex.coordinateKey = coordKey;
        ex.samples = rows;
        samplingErrors.push(ex);
      } else {
        throw ex;
      }
    }

    return acc + result;
  },
  "");

  const error =
    interpretationErrors.length || samplingErrors.length
      ? new SequenceRecognitionError(interpretationErrors, samplingErrors)
      : null;
  return [sequence, newSignature, error];
}

function getPan(redPixelData: number[]) {
  let [pan, panHasNewSignature, panError] = recognizeSequence(
    PAN_COORDINATES,
    redPixelData
  );
  if (!luhn.validate(pan)) {
    panError = new InvalidPanError(printPan(pan));
  }
  return [pan, panHasNewSignature, panError];
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
