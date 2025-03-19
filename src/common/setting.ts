import { ChatOpenAI } from "@langchain/openai";
import OpenAI from "openai";
const baseURLMap:BaseURLMap = {
  aliyuncs: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
};
// const modele=OpentAiOptions({modelName:'gpt-3.5-turbo-16k',
//   openAIApiKey: 'sk-3869937890393011203',
//   baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
// })
export const OpentAiOptions =(modelobject:Modelobject):OpenAI=>{
  const openai = new OpenAI(
    {
      
      apiKey:modelobject.openAIApiKey||process.env.ARK_API_KEY,
      baseURL:baseURLMap[modelobject.baseURL]||"https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
  );
  return openai;
}
export const model = new ChatOpenAI({
  modelName: "deepseek-v3",
  temperature: 0.3,
  maxTokens: 2046,
  openAIApiKey: process.env.ARK_API_KEY,
  configuration: {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  },
});
