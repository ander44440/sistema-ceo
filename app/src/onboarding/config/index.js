import config from "./onboarding.json";

export function carregarConfigOnboarding() {
  return structuredClone(config);
}

export { config as onboardingConfigDefault };
