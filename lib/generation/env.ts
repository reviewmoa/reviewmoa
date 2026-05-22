import "server-only";

export function getInternalJobSecret() {
  const secret = process.env.INTERNAL_JOB_SECRET;

  if (!secret) {
    throw new Error("INTERNAL_JOB_SECRET is required");
  }

  return secret;
}

export function getGenerationSecrets() {
  return {
    githubToken: process.env.GITHUB_TOKEN,
    aiApiKey: process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY,
    aiBaseUrl: process.env.AI_API_BASE_URL ?? "https://api.openai.com/v1",
    aiModel: process.env.AI_MODEL ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini"
  };
}
