import 'dotenv/config';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

function handleResponse(res) {
  if (res.status !== 200) {
    return res.text().then((text) => {
      throw new Error(`${text} (status: ${res.status})`);
    });
  }
  return res.json();
}

export async function chat(userMessage) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    // check response status
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }

    const data = await response.json(); // parse json
    console.log("API Response:", data);

    if (data.choices && data.choices.length > 0) {
      return { reply: data.choices[0].message.content };
    } else {
      throw new Error("No valid response from AI");
    }
  } catch (error) {
    console.error("Error during API call:", error);
    throw error;
  }
} 