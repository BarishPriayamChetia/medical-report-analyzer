import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import Nav from "./Nav";
import Tesseract from "tesseract.js"; // Import Tesseract.js

export default function Ocr() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Extract text using Tesseract.js
  const extractTextFromImage = async (image) => {
    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng", {
        logger: (m) => console.log(m), // Optional logger
      });
      return text.trim();
    } catch (error) {
      console.error("OCR Error:", error);
      setError("Error extracting text.");
      return "";
    }
  };

  // Summarize text using Ollama API
  const summarizeText = async (text) => {
    try {
      const response = await fetch("http://127.0.0.1:11434/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistral", // Change model if needed
          prompt: `Summarize the following text:\n\n${text}`,
          stream: false,
        }),
      });

      const data = await response.json();
      return data.response || "No summary available.";
    } catch (error) {
      console.error("Ollama API Error:", error);
      setError("Error summarizing text.");
      return "";
    }
  };

  // Handle image processing and text extraction
  const processImage = async (event) => {
    event.preventDefault();
    if (!image) {
      alert("Please upload an image first!");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const extractedText = await extractTextFromImage(image);
      setText(extractedText);

      if (extractedText) {
        const summary = await summarizeText(extractedText);
        setSummary(summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <>
      <div className="w-full flex justify-center items-center flex-col">
        <Nav />
      </div>

      <div className="flex flex-col items-center w-full max-w-xl p-12 mx-auto rounded-lg shadow-xl bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
        <form className="grid gap-3 w-full">
          <div>
            <h2 className="text-xl font-semibold">Upload a file</h2>
            <p className="text-sm text-gray-500">Accepted formats: .png, .jpg</p>
            <label
              htmlFor="image-upload"
              className="group relative mt-2 flex h-72 cursor-pointer flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
            >
              {preview ? (
                <img src={preview} alt="Uploaded" className="h-full w-full object-contain rounded-md" />
              ) : (
                <div className="absolute z-[5] h-full w-full rounded-md flex items-center justify-center text-gray-500">
                  Click to upload
                </div>
              )}
            </label>
            <input onChange={handleImageUpload} id="image-upload" type="file" accept="image/*" className="hidden" />
          </div>

          <button
            style={{ backgroundColor: isLoading ? "grey" : "#eb5c0c" }}
            onClick={processImage}
            className="border-gray-200 text-white flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
            disabled={isLoading}
          >
            <p className="text-sm">{isLoading ? "Processing..." : "Generate Summary"}</p>
          </button>
        </form>
      </div>

      <div className="mt-10">
        <div className="flex flex-col items-center w-full max-w-xl py-12 mx-auto rounded-lg shadow-xl bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
          <h2 className="text-xl font-semibold">Extracted Text</h2>
          {error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <p>{isLoading ? "Processing..." : text}</p>
          )}
        </div>

        <div className="flex flex-col items-center w-full max-w-xl py-12 mx-auto rounded-lg shadow-xl bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
          <h2 className="text-xl font-semibold">Summarized Report</h2>
          {error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <p>{isLoading ? "Generating summary..." : summary}</p>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}