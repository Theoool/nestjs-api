export const DEFAULT_AI_CONFIG = {
  modelName:   'deepepseek-v3',
  openAIApiKey: process.env.AI_API_KEY ,
  baseURL: process.env.AI_BASE_URL,
  maxTokens: 2000,
  frequencyPenalty: 0.5,
  timeout: 30000
};

export const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 60 * 2400, //
  maxRequests: 10, // 每个IP每窗口最大请求数
  redisPrefix: 'ai_rate_limit:'
};
