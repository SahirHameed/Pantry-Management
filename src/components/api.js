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

  try {
    const response = await fetch(LLAMA_API_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
      }),
    });

    // Log the raw response text
    const responseText = await response.text();
    console.log("Raw response:", responseText);

    if (!response.ok) {
      console.error("Error details:", responseText);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${responseText}`
      );
    }

    // Parse the response as JSON
    const data = JSON.parse(responseText);
    const rawRecipes = data.choices[0].message.content;

    const recipeSections = rawRecipes
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
