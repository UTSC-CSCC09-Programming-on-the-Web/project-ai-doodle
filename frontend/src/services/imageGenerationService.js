const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

export async function generateImageWithAI(prompt, model = "dall-e-3") {
  if (!OPENAI_API_KEY) {
    throw new Error(
      "OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env file.",
    );
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          prompt: prompt,
          n: 1,
          size: "1024x1024",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        model: model,
        prompt: prompt.substring(0, 50) + "...",
      });
      throw new Error(
        `API call failed (${model}): ${errorData.error?.message || response.statusText}`,
      );
    }

    const data = await response.json();
    console.log("API Response:", data);

    if (data.data && data.data.length > 0) {
      const imageData = data.data[0];

      // Handle base64 format images
      let imageUrl;
      if (imageData.b64_json) {
        imageUrl = `data:image/png;base64,${imageData.b64_json}`;
      } else if (imageData.url) {
        imageUrl = imageData.url;
      } else {
        throw new Error("No image data in response");
      }

      return {
        imageUrl: imageUrl,
        revisedPrompt: imageData.revised_prompt || prompt,
        usage: data.usage,
        created: data.created,
      };
    } else {
      throw new Error("No image generated");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

// Fallback solution: use other image services if OpenAI API is unavailable
export async function generateImageFallback(prompt, model = "dall-e-3") {
  // Use free image service as example
  const keywords = prompt.split(" ").slice(0, 3).join(","); // Take first 3 keywords
  const randomId = Math.floor(Math.random() * 1000);

  // Use Unsplash or Lorem Picsum as placeholder
  return {
    imageUrl: `https://picsum.photos/512/512?random=${randomId}`,
    revisedPrompt: prompt,
    usage: {
      total_tokens: 0,
      input_tokens: 0,
      output_tokens: 0,
    },
    created: Date.now(),
    model: model,
  };
}
