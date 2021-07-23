import expectedNumberSignatures, {
  numberProfiles,
  MAX_OFFSET,
} from "../../expectedNumberSignatures";

// If there are duplicate entries, the number of keys should be reduced
// as the implementation to populate them would result in duplicate
// keys being overwritten.
describe("OCRaProcessor: expectedNumberSignatures", () => {
  it("has the expected number of signatures", () => {
    expect(Object.keys(expectedNumberSignatures).length).toEqual(
      numberProfiles.length * (MAX_OFFSET + 1)
    );
  });
});
