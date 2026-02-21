// Gemini API pricing — per 1M tokens, USD, paid tier, standard (non-batch)
// Source: https://ai.google.dev/gemini-api/docs/pricing
// Update this file when Google changes pricing.
//
// Fields:
//   input    — non-cached input tokens (prompts <= 200k)
//   output   — output + thinking tokens
//   cache    — cached input tokens (context caching price)
//   storage  — cache storage per 1M tokens per hour

window.GEMINI_PRICING = {
  'gemini-3-flash-preview': {
    input:   0.50,
    output:  3.00,
    cache:   0.05,
    storage: 1.00
  },
  'gemini-3-pro-preview': {
    input:   2.00,
    output:  12.00,
    cache:   0.20,
    storage: 4.50
  },
  'gemini-3.1-pro-preview': {
    input:   2.00,
    output:  12.00,
    cache:   0.20,
    storage: 4.50
  }
};
