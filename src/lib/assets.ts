/** Keep public assets valid on both a domain root and a GitHub Pages project path. */
export function assetUrl(filename: string) {
  return `${import.meta.env.BASE_URL}assets/${filename}`;
}
