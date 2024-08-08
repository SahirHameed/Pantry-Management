// src/api.js
const OPENROUTER_API_KEY = process.env.NEXT_PUBLIC_OPENAI_KEY;

console.log("Loaded API Key:", OPENROUTER_API_KEY);

if (!OPENROUTER_API_KEY) {
  throw new Error(
    "The OPENROUTER_API_KEY environment variable is missing or empty."
  );
}

export const fetchRecipes = async (pantryItems) => {
  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: [
            {
              role: "user",
              content: `Generate at least 3 recipes using the following ingredients: ${pantryItems
                .map((item) => `${item.amount} ${item.name}`)
                .join(", ")} and explain them in 5 lines.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorDetails = await response.clone().json();
      console.error("Error details:", errorDetails);
      throw new Error(
        `HTTP error! status: ${response.status}, details: ${JSON.stringify(
          errorDetails
        )}`
      );
    }

    const data = await response.json();
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
  } catch (error) {
    console.error("Error generating recipes: ", error);
    return [];
  }
};
