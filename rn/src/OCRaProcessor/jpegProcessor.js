/** @flow */
import RNFetchBlob from "rn-fetch-blob";
import { Buffer } from "buffer";
import jpeg from "jpeg-js";

export async function getPathAndEncodedImageFromUrl(url: string) {
  const response = await RNFetchBlob.config({ fileCache: true }).fetch(
    "GET",
    url
  );
  const base64 = await response.readFile("base64");
  return [base64, response.path()];
}

export function filterRedPixelData(jpegData: any) {
  return jpegData.data.filter((_, idx) => !(idx % 4));
}

export async function redPixelDataFromBase64Image(base64: string | number[]) {
  const jpegBuffer = Buffer.from(base64, "base64");
  return filterRedPixelData(jpeg.decode(jpegBuffer, { useTArray: true }));
}
