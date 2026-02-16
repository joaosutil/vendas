export function getEbookFilePathBySlug(slug: string) {
  if (slug === "ansiedade" || slug.includes("ansiedade")) {
    return process.env.ANSIEDADE_PDF_FILE_PATH || "assets/ansiedade.pdf";
  }
  return null;
}
