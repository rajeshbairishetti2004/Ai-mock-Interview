import { NextResponse } from "next/server";
import mammoth from "mammoth";
import PDFParser from "pdf2json";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = "";

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".pdf") || file.type === "application/pdf") {
      extractedText = await new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1);
        pdfParser.on("pdfParser_dataError", (errData) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData) => {
          resolve(pdfParser.getRawTextContent());
        });
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      fileName.endsWith(".docx") ||
      file.type.includes("wordprocessingml.document")
    ) {
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload a PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json(
        { error: "Failed to extract text from file or file is empty" },
        { status: 400 }
      );
    }

    // Clean up specific PDF artifact texts if needed
    const cleanText = extractedText.replace(/\r\n/g, '\n').trim();

    return NextResponse.json({ text: cleanText });
  } catch (error) {
    console.error("❌ Parse Error:", error);
    return NextResponse.json(
      { error: "Failed to parse file: " + (error.message || String(error)) },
      { status: 500 }
    );
  }
}
