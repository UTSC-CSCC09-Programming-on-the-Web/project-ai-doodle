const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

// check if prompt contains secret word (simple string matching)
export function checkPromptContent(prompt, secretWord) {
  if (!prompt || !secretWord) return false;

  // convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();
  const lowerSecretWord = secretWord.toLowerCase();

  // check if prompt contains the secret word
  return lowerPrompt.includes(lowerSecretWord);
}

// validate final guess (supports synonyms)
export async function validateFinalGuess(
  guess,
  secretWord,
  allowSynonyms = true,
) {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key is not configured");
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
            content: `You are a game judge for a word guessing game. Your task is to determine if the player's guess is correct.

Rules:
1. If allowSynonyms is true: Accept the guess if it's the exact word OR a reasonable synonym
2. If allowSynonyms is false: Only accept the exact word (case insensitive)
3. Return only "true" if the guess is correct, "false" otherwise
4. Be reasonable but not too lenient with synonyms`,
          },
          {
            role: "user",
            content: `Secret word: "${secretWord}"
Player's guess: "${guess}"
Allow synonyms: ${allowSynonyms}

Is the guess correct? Answer only "true" or "false".`,
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
