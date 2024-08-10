"use server";

const LLAMA_API_URL = "https://api.llama-api.com/chat/completions";

export const fetchRecipesFromApi = async (ingredients) => {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_LLAMA_API_KEY}`,
    "Access-Control-Allow-Origin": "*",
  };

  const prompt = `Create detailed recipes using the following ingredients: ${ingredients
    .map((item) => `${item.amount} ${item.name}`)
    .join(", ")}. Each recipe should include:
  1. A title.
  2. A brief description.
  3. A list of ingredients with quantities.
  4. Detailed step-by-step cooking instructions.`;

  let fullResponse = "";
  let continuationPrompt = prompt;
  let stopRequest = false;

  try {
    while (!stopRequest) {
      const response = await fetch(LLAMA_API_URL, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: [{ role: "user", content: continuationPrompt }],
          max_tokens: 1500, // Increase this if the API allows it
        }),
      });

      const data = await response.json();
      const responseText = data.choices[0].message.content;

      // Append the received text to the full response
      fullResponse += responseText;

      // Check if the response was cut off
      if (data.choices[0].finish_reason === "max_token") {
        // Prepare to continue the request
        continuationPrompt = "Continue the previous response.";
      } else {
        // Exit the loop if the response is complete
        stopRequest = true;
      }
    }

    // Process the full response
    const recipeSections = fullResponse
      .split(/Recipe \d+:/)
      .filter((section) => section.trim() !== "");
    const formattedRecipes = recipeSections.map((section) => {
      const [title, ...steps] = section
        .split("\n")
        .filter((line) => line.trim() !== "");
      return {
        title: title.replace(/\*/g, "").trim(),
        steps: steps
          .map((step) => step.replace(/\*/g, "").trim())
          .filter((step) => step !== ""),
      };
    });

    return formattedRecipes;
  } catch (e) {
    console.log(e);
    throw e;
  }
};