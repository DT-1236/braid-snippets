/** @flow */
import ReactNativeBlobUtil from "react-native-blob-util";
import { Buffer } from "buffer";
import jpeg from "jpeg-js";
import Bugsnag from "../Bugsnag";

export async function getPathAndEncodedImageFromUrl(url: string) {
  try {
    const response = await ReactNativeBlobUtil.config({
      fileCache: true,
    }).fetch("GET", url);
    const base64 = await response.readFile("base64");
    return [base64, response.path()];
  } catch (ex) {
    Bugsnag.notify(ex);
    throw ex;
  }
}

export function filterRedPixelData(jpegData: any) {
  return jpegData.data.filter((_, idx) => !(idx % 4));
}

export async function redPixelDataFromBase64Image(base64: string | number[]) {
  const jpegBuffer = Buffer.from(base64, "base64");
  return filterRedPixelData(jpeg.decode(jpegBuffer, { useTArray: true }));
}
