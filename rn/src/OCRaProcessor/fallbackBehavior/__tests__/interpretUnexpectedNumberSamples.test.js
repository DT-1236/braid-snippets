import jpeg from "jpeg-js";
import interpretUnexpectedNumberSamples from "../interpretUnexpectedNumberSamples";
import getNumberSamples from "../../getNumberSamples";
import { filterRedPixelData } from "../../jpegProcessor";
import {
  PAN_COORDINATES,
  MONTH_COORDINATES,
  YEAR_COORDINATES,
  CVV_COORDINATES,
} from "../../ocrConfig";

jest.mock("rn-fetch-blob", () => jest.fn());
// the global Buffer exists in jest-land
jest.mock("buffer", () => ({ Buffer: global.Buffer }));

// This exists in jest!
import fs from "fs";

function fileToRedPixelData(path) {
  const buffer = fs.readFileSync(process.cwd() + path, "base64");
  // global buffer exists in jest world
  // eslint-disable-next-line no-undef
  const jpegBuffer = Buffer.from(buffer, "base64");
  return filterRedPixelData(jpeg.decode(jpegBuffer));
}

const STATIC_PAN = "52719700";
function filenameToTestData(name) {
  const path = `/src/OCRaProcessor/fallbackBehavior/__tests__/assets/${name}.jpeg`;
  const redPixelData = fileToRedPixelData(path);
  const panTail = name.match(/\d+/g);
  const panString = panTail ? STATIC_PAN + panTail : null;
  return { name, redPixelData, panString };
}

const filenames = ["dev03635419", "dev43876262", "dev81854288"];
const testData = filenames.map(filenameToTestData);
const scribbledData = filenameToTestData("scribbled");

function testCoordinates(x, y, key, redPixelData, dataName, expected) {
  const samples = getNumberSamples(x, y, redPixelData);
  const testDescription = `${key}: ${dataName}`;
  expect([
    testDescription,
    interpretUnexpectedNumberSamples(samples, key),
  ]).toStrictEqual([testDescription, expected]);
}

function testStaticValues(expectedValues, coordinateSet) {
  expectedValues.forEach((result, idx) => {
    const [x, y, key] = coordinateSet[idx];
    testData.forEach(({ name, redPixelData }) =>
      testCoordinates(x, y, key, redPixelData, name, result)
    );
  });
}

function testVaryingValues(indices, coordinateSet) {
  indices.forEach((idx) => {
    const [x, y, key] = coordinateSet[idx];
    testData.forEach(({ name, redPixelData, panString }) =>
      testCoordinates(
        x,
        y,
        key,
        redPixelData,
        name,
        parseInt(panString.charAt(idx), 10)
      )
    );
  });
}

function testUnintelligibleStaticValues(expectedValues, coordinateSet) {
  expectedValues.forEach((result, idx) => {
    const [x, y, key] = coordinateSet[idx];
    const { name, redPixelData } = scribbledData;
    expect(() =>
      testCoordinates(x, y, key, redPixelData, name, result)
    ).toThrow();
  });
}

function testUnintelligibleVaryingValues(indices, coordinateSet) {
  indices.forEach((idx) => {
    const [x, y, key] = coordinateSet[idx];
    const { name, redPixelData } = scribbledData;
    expect(() => testCoordinates(x, y, key, redPixelData, name, 0)).toThrow();
  });
}

const originalConsoleError = console.error;

describe("OCRaProcessor: interpretUnexpectedNumberSamples", () => {
  // This method is not intended to be called often, so it will throw whenever
  // it's called. We'll silence it for testing.
  beforeEach(() => {
    console.error = jest.fn();
  });
  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe("Expiry Month", () => {
    const expectedResults = [0, 5];
    const coordinates = MONTH_COORDINATES;
    it("recognizes dev month as 05", () => {
      testStaticValues(expectedResults, coordinates);
    });

    it("throws when image is unintelligible", () => {
      testUnintelligibleStaticValues(expectedResults, coordinates);
    });
  });

  describe("Expiry Year", () => {
    const expectedResults = [2, 4];
    const coordinates = YEAR_COORDINATES;
    it("recognizes dev year as 24", () => {
      testStaticValues(expectedResults, coordinates);
    });

    it("throws when image is unintelligible", () => {
      testUnintelligibleStaticValues(expectedResults, coordinates);
    });
  });

  describe("CVV", () => {
    const expectedResults = [1, 2, 3];
    const coordinates = CVV_COORDINATES;
    it("recognizes dev cvv as 123", () => {
      testStaticValues(expectedResults, coordinates);
    });

    it("throws when image is unintelligible", () => {
      testUnintelligibleStaticValues(expectedResults, coordinates);
    });
  });

  describe("PAN", () => {
    describe("First 8 digits in dev", () => {
      const expectedResults = [5, 2, 7, 1, 9, 7, 0, 0];
      const coordinates = PAN_COORDINATES;
      it("recognizes first 8 PAN in dev as 52719700", () => {
        testStaticValues(expectedResults, coordinates);
      });
    });

    describe("Last 8 digits in dev", () => {
      const indices = [8, 9, 10, 11, 12, 13, 14, 15];
      const coordinates = PAN_COORDINATES;
      it("recognizes the varying digits of the last 8 PAN in dev", () => {
        testVaryingValues(indices, coordinates);
      });
      it("throws when image is unintelligible", () => {
        testUnintelligibleVaryingValues(indices, coordinates);
      });
    });
  });
});