/**
 * Some seeded/placeholder uploads are literally 1x1 pixel stub files rather
 * than real photos — `object-cover` stretches them into a solid color block
 * that looks like a rendering bug. Treat anything at or below this size as
 * "no real photo" and fall back to the placeholder tile instead.
 */
const MIN_VALID_IMAGE_DIMENSION = 8;

export function isDegenerateImage(img: HTMLImageElement): boolean {
  return (
    img.naturalWidth <= MIN_VALID_IMAGE_DIMENSION || img.naturalHeight <= MIN_VALID_IMAGE_DIMENSION
  );
}
