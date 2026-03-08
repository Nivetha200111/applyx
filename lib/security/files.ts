export type ResumeFileKind = "pdf" | "docx";

const PDF_SIGNATURE = Buffer.from("%PDF-");
const ZIP_SIGNATURE = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

function bufferStartsWith(buffer: Buffer, signature: Buffer) {
  if (buffer.length < signature.length) {
    return false;
  }

  return buffer.subarray(0, signature.length).equals(signature);
}

function looksLikeDocx(buffer: Buffer) {
  if (!bufferStartsWith(buffer, ZIP_SIGNATURE)) {
    return false;
  }

  const zipText = buffer.toString("latin1");
  return zipText.includes("word/document.xml") && zipText.includes("[Content_Types].xml");
}

export function getResumeFileExtension(fileName: string): ResumeFileKind | null {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".pdf")) {
    return "pdf";
  }

  if (lowerName.endsWith(".docx")) {
    return "docx";
  }

  return null;
}

export function detectResumeFileKind(buffer: Buffer): ResumeFileKind | null {
  if (bufferStartsWith(buffer, PDF_SIGNATURE)) {
    return "pdf";
  }

  if (looksLikeDocx(buffer)) {
    return "docx";
  }

  return null;
}

export function validateResumeFile(buffer: Buffer, fileName: string): ResumeFileKind | null {
  const extensionKind = getResumeFileExtension(fileName);
  const detectedKind = detectResumeFileKind(buffer);

  if (!extensionKind || !detectedKind) {
    return null;
  }

  return extensionKind === detectedKind ? detectedKind : null;
}
