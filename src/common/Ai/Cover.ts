import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains';
import { ChatOpenAI } from "@langchain/openai";
import { getCoverRolePrompt } from './coverRoles';
import { extractSeoEssentials } from "./seo";
import { firstValueFrom } from "rxjs";
import { HttpService } from "@nestjs/axios";

const buildRolePrompt = (roleName?: string) => {
  const template = getCoverRolePrompt(roleName); // 传递 roleName
  console.log('生成的提示模板:', template); // 调试提示模板
  return new PromptTemplate({
    template,
    inputVariables: ['text']
  });
};

const baseURLMap:BaseURLMap = {
  aliyuncs: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  siliconflow: 'https://api.siliconflow.cn/v1',
};


export async function getCoverAnalysis(url: string, 
  roleName?: string,modelobject?:Modelobject) {
  const model = new ChatOpenAI({
    modelName: modelobject.modelName||"deepseek-v3",
    temperature: 0.7,
    streaming: false, // 保持非流式
    maxTokens: 1024,
    openAIApiKey: modelobject.openAIApiKey||process.env.ARK_API_KEY,
    configuration: {
      baseURL: modelobject.baseURL||"https://dashscope.aliyuncs.com/compatible-mode/v1"
    }
  });
  const service = new HttpService();

  try {
    // Validate URL
    if (!url.startsWith('http')) throw new Error('Invalid URL');

    // Fetch webpage
    const response = await firstValueFrom(
      service.get(url, {
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 ... Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000,
      })
    );
    const seoData = extractSeoEssentials(response.data);
    const chain = new LLMChain({
      llm: model,
      prompt: buildRolePrompt(roleName),
      outputKey: 'result',
    });
  
    const inputText = `${JSON.stringify(seoData.meta.description+seoData.content)}\n附加要求:网页宣传封面,积极明亮,16K超高清细节`;
    console.log('Model input:', inputText);
    

    const data = await chain.call({ text: inputText });
    const urlMatch = data.result.match(/url=(.+)/); // 匹配 "url=" 后面的内容
    const altMatch = data.result.match(/alt=(.+)/); // 匹配 "alt=" 后面的内容
    return {
      url: urlMatch ? urlMatch[1] : null,
      alt: altMatch? altMatch[1] : null,
    };
  } catch (error) {
    console.error('Cover analysis error:', error.response?.status, error.message);
    throw new Error(`Analysis failed: ${error.message || 'Unknown error'}`);
  }
}
