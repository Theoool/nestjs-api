import { Document } from 'langchain/document';
import { OpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from "@langchain/core/runnables";
// 更新这行导入
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio"

// import { RecursiveCharacterTextSplitter } from 'langchain/dist/text_splitter';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

async function processContent(content: string) {
  // 1. 文本分割
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const docs = await textSplitter.createDocuments([content]);

  // 2. 创建自定义提示模板
  const promptTemplate = new PromptTemplate({
    template: `
    请对以下内容生成一个简洁的摘要：
    
    {text}
    
    要求：
    1. 控制在100字以内
    2. 保持客观准确
    3. 突出核心信息
    4. 使用简洁的语言
    
    摘要：`,
    inputVariables: ["text"],
  });

  // 3. 创建 LLM 实例
  const model = new OpenAI({
    temperature: 0,
    modelName: "gpt-3.5-turbo",
  });

  // 4. 创建处理链
  const chain = RunnableSequence.from([
    {
      text: (input) => input.text
    },
    promptTemplate,
    model
  ]);

  // 5. 处理每个文档块
  const summaries = await Promise.all(
    docs.map(async (doc) => {
      const result = await chain.invoke({
        text: doc.pageContent,
      });
      return result;
    })
  );

  // 6. 合并所有摘要
  const finalSummary = summaries.join("\n\n");

  return finalSummary;
}

// 使用示例
export async function parseWebPageForAI(url: string) {
  const httpService = new HttpService();
  try {
    const response = await firstValueFrom(httpService.get(url)) ;
    // console.log(response.data);
    
    const htmlContent = response.data;
    
    // 1. 获取网页内容
    const loader = new CheerioWebBaseLoader(htmlContent);
    const [doc] = await loader.load();
    
    // 2. 处理内容
    const summary = await processContent(doc.pageContent);
    console.log(summary);
    
    return summary;
    

  } catch (error) {
    console.error('处理失败:', error);
    throw error;
  }
}


