const cors = require("cors");
const express = require("express");
const fetch = require("node-fetch");

const app = express();

// ✅ ALLOW SPECIFIC FRONTEND ORIGIN
app.use(cors({
  origin: "https://medical-report-analyzer-f94n.vercel.app"
}));

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
