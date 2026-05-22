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
    aiApiKey: process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY
  };
}
