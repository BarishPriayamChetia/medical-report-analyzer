const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/generate", async (req, res) => {
  try {
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const data = await ollamaRes.json();
    res.json(data);
  } catch (error) {
    console.error("Error forwarding to Ollama:", error);
    res.status(500).json({ error: "Ollama connection failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));
app.post("/api/generate", async (req, res) => {
  try {
    console.log("Received request to generate:", req.body);
    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });
    console.log("Ollama response received");

    const data = await ollamaRes.json();
    console.log("Generated data:", data);
    res.json(data);
  } catch (error) {
    console.error("Error forwarding to Ollama:", error);
    res.status(500).json({ error: "Ollama connection failed" });
  }
});