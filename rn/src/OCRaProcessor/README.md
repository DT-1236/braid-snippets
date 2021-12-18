# OCRa Font Recognition Processor

A package for processing the numbers within the OCRa font. It works by taking a set of coordinates corresponding to locations of numbers within a file. It then samples 3 bands of each area. Analysis of the bands yields a number output.

## Debugging an individual card

It's arguably simplest to test inside of a node/jest environment since our react native app doesn't have great file system support. If a card with novel/buggy digits is found, save the image to `/fallbackBehavior/__tests__/assets/` as a jpeg with a filename that includes the last 8 of the PAN. It is important to name it this way, because it is how the test is informed of the last 8 PAN digits.

Then, look at the "Novel Case" block of tests in `interpretUnexpectedNumberSamples.test`. The `novelFilename` variable should be updated to reflect the filename of the card image in question. The string values of "replaceMeWithActualExpectedValues" should instead be replaced with their corresponding number values. Then, the `skip` should be removed from the test declaration.

Examine the output of `yarn test:native interpretUnexpectedNumberSamples`. Hopefully, it should guide your efforts.

### Interpret the results

Example correct output:

> Encountered an unexpected number signature:
> 0000111111100000
> 0000110001100000
> 0011000000011000
> was interpreted as: 8 with an offset of 0

The 3 lines of numbers correspond to the 3 bands that were sampled in the number's field. They are taken from a "high", "low" and "middle" range. This particular output seems to be consistent with an 8 of OCRa font.

Example buggy output:

> Encountered an unexpected number signature:
> 0000001111111111
> 1000000000000001
> 0000000000110000
> was interpreted as: 9 with an offset of 0

It is strange that there should be signal in the far left of the middle band. There aren't any OCRa number characters for which that might be the case. Additionally, the top and middle rows have signal to the far right, which suggests that the frame for this number ought to be moved forward. If the results were further examined, the analyses would show something like, `WIDE` for the top, `LEFT_AND_RIGHT` for the middle, and `RIGHT` for the bottom. All together, the package understands that to be a `9`. However, the output here doesn't look like a 9, it looks more like a 7 that was moved to the right. If the frame is shifted the right (by increasing the value of the first number in the corresponding digit in `ocrConfig`), the input would be correctly evaluated to `7`.

From this point on the fix could be any number of things. Some possibilities include:

1. The values in `ocrConfig.js` need a small update. One of the values may result in an invalid/flaky "frame". These types of adjustments should probably be done a little more generally. As an example, if it seems that shifting the frame of PAN 8 resolves the issues for one card, it should strongly be considered to shift the frames of PAN#s 9-15 as well, and perhaps even PAN#s before 8.
1. The values in `ocrConfig.js` need a _large_ update. This would only happen if the numbers are moving dramatically (_eg_ - they are now right aligned, the font size has changed and so the frame sizes are no longer accurate).
1. The logic engine for `anlayzeLow`/`analyzeMiddle`/`analyzeTop` must be updated. I'd expect this to only be necessary if the font was changed from OCRa. It _may_ be possible that this is necessary if the font size changes, however.

After the issue is resolved, add an acceptance test. This will require a new test asset be added. The filename can be whatever you choose, but it must redact all but one number. If the buggy image has multiple values that were addressed, create a new test image for each value (_eg_ - If a test image unveiled problems with PAN 6 and CVV 2, then two images must be created, one where all numbers except PAN 6 are redacted, and another where all numbers except CVV 2 are redacted).
