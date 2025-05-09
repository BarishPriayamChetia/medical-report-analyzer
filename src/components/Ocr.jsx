import React, { useState, useEffect } from "react";
import Footer from "./Footer";
import Nav from "./Nav";
import Tesseract from "tesseract.js";

export default function Ocr() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setError(null);
    } else {
      alert("Please upload a valid image file.");
    }
  };

  const extractTextFromImage = async (image) => {
    try {
      const { data: { text } } = await Tesseract.recognize(image, "eng", {
        logger: (m) => console.log(m),
      });
      return text.trim();
    } catch (error) {
      console.error("OCR Error:", error);
      setError("Error extracting text.");
      return "";
    }
  };

  const summarizeText = async (text) => {
    try {
      const response = await fetch(`${backendUrl}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || "Unknown backend error";
        throw new Error(errorMessage);
      }

      return data.content || "No summary available.";
    } catch (error) {
      console.error("Backend API Error:", error.message);
      setError(error.message);
      return "";
    }
  };

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

      if (!extractedText) {
        setError("No text extracted from the image.");
        return;
      }

      const summaryResult = await summarizeText(extractedText);
      setSummary(summaryResult);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
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
              aria-label="Upload an image"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Uploaded"
                  className="h-full w-full object-contain rounded-md"
                />
              ) : (
                <div className="absolute z-[5] h-full w-full rounded-md flex items-center justify-center text-gray-500">
                  Click to upload
                </div>
              )}
            </label>
            <input
              onChange={handleImageUpload}
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
            />
          </div>

          <button
            style={{ backgroundColor: isLoading ? "grey" : "#eb5c0c" }}
            onClick={processImage}
            className="border-gray-200 text-white flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Generate Summary"}
          </button>
        </form>
      </div>

      <div className="mt-10">
        <div className="flex flex-col items-center w-full max-w-xl py-12 mx-auto rounded-lg shadow-xl bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
          <h2 className="text-xl font-semibold">Extracted Text</h2>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <p className="whitespace-pre-line">
              {isLoading ? "Processing..." : text || "No text extracted yet."}
            </p>
          )}
        </div>

        <div className="flex flex-col items-center w-full max-w-xl py-12 mx-auto rounded-lg shadow-xl bg-white/30 ring-1 ring-gray-900/5 backdrop-blur-lg">
          <h2 className="text-xl font-semibold">Summarized Report</h2>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <ul className="list-disc list-inside text-left whitespace-pre-line">
              {summary.split("- ").filter(Boolean).map((item, idx) => (
                <li key={idx}>{item.trim()}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
