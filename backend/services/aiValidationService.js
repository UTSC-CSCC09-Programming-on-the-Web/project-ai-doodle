import fetch from "node-fetch";

// validate final guess (supports synonyms)
export async function validateFinalGuess(
  guess,
  secretWord,
  allowSynonyms = true,
) {
  const OPENAI_API_KEY = process.env.VITE_OPENAI_API_KEY;
  console.log(
    "Backend OPENAI_API_KEY loaded inside function:",
    OPENAI_API_KEY ? `${OPENAI_API_KEY.substring(0, 10)}...` : "NOT FOUND",
  );

  // if no API key, fallback to simple string matching
  if (!OPENAI_API_KEY) {
    console.log("No OpenAI API key, using simple string matching");
    return guess.toLowerCase().trim() === secretWord.toLowerCase().trim();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a game judge for a word guessing game. Your task is to determine if the player's guess is correct.\n\nRules:\n1. If allowSynonyms is true: Accept the guess if it's the exact word OR a reasonable synonym\n2. If allowSynonyms is false: Only accept the exact word (case insensitive)\n3. Return only \"true\" if the guess is correct, \"false\" otherwise\n4. Be reasonable but not too lenient with synonyms`,
          },
          {
            role: "user",
            content: `Secret word: \"${secretWord}\"\nPlayer's guess: \"${guess}\"\nAllow synonyms: ${allowSynonyms}\n\nIs the guess correct? Answer only \"true\" or \"false\".`,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json();
    const result = data.choices[0].message.content.trim().toLowerCase();
    return result === "true";
  } catch (error) {
    console.error("Error validating final guess:", error);
    throw error;
  }
}
