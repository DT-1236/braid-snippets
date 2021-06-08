/** @flow */
import RNFetchBlob from "rn-fetch-blob";
import { Buffer } from "buffer";
import jpeg from "jpeg-js";

async function getEncodedImageFromUrl(url) {
  const response = await RNFetchBlob.config({ fileCache: true }).fetch(
    "GET",
    url
  );
  const base64 = await response.readFile("base64");
  RNFetchBlob.fs.unlink(response.path());
  return base64;
}

export function filterRedPixelData(jpegData: any) {
  return jpegData.data.filter((_, idx) => !(idx % 4));
}

export async function redPixelDataFromUrl(url: string) {
  const base64 = await getEncodedImageFromUrl(url);
  const jpegBuffer = Buffer.from(base64, "base64");
  return filterRedPixelData(jpeg.decode(jpegBuffer));
}
