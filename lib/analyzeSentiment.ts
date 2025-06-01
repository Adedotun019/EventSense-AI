import axios from "axios";

const HUGGINGFACE_API_TOKEN = process.env.HUGGINGFACE_API_TOKEN;
const HF_API_URL = "https://api-inference.huggingface.co/models/j-hartmann/emotion-english-distilroberta-base";

export async function analyzeSentiment(text: string): Promise<string | null> {
  if (!HUGGINGFACE_API_TOKEN) {
    console.warn("HUGGINGFACE_API_TOKEN not found, skipping sentiment analysis");
    return null;
  }

  try {
    const res = await axios.post(
      HF_API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictions = res.data?.[0];
    if (!Array.isArray(predictions)) return null;

    const top = predictions.sort((a, b) => b.score - a.score)[0];
    return top.label?.toLowerCase() || null;
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Sentiment analysis error:", err.message);
    } else {
      console.error("Sentiment analysis error:", err);
    }
    return null;
  }
}
