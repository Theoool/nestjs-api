
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains'


// 1. 定义提示模板
const SUMMARY_PROMPT = `请根据以下网页收藏合集生成,关键词和关联词要有预言性,发展性,精准性：
1. 简短摘要：用诙谐幽默的话总结这个收藏合集
2. 关键词：
   - 核心词(3) | 技术/工具(3) | 场景/用途(3) 
3. 关联词：
   - 技术关联(3) | 场景扩展(3) | 上下级概念(3)
`;


export async function tagAI(combinedText: string) {
  // return combinedText
  try {
    
    
    // 合并所有段落为一个文本
    // const combinedText = sections.join('\n\n');
    console.log('提取的文本长度:', combinedText.length);
    // console.log('开始生成摘要...\n');

    const model = new ChatOpenAI({
      modelName: "ep-20241102134011-258bh",
      temperature: 0.3,
      maxTokens:3500,
      openAIApiKey: process.env.ARK_API_KEY,
      configuration: {
        baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
      }
    });

    // 创建提示模板
    const promptTemplate = new PromptTemplate({
      template: SUMMARY_PROMPT,
      inputVariables: ["text"],
    });

    // 创建处理链
    const chain = new LLMChain({
      llm: model,
      prompt: promptTemplate,
  
    });

    // 直接处理合并后的文本
    const result = await chain.invoke({
      text: combinedText,
    });

// return result.text
    // 流式输出最终结果
    const stream = await model.stream([
      {
        role: "system",
        content:SUMMARY_PROMPT

      },
      {
        role: "user",
        content: `以下是我提供的合集信息,${combinedText}`
      }
    ]);

    let finalSummary = '';
    for await (const chunk of stream) {
      const content = chunk.content.toString();
      finalSummary += content;
      process.stdout.write(content);
    }
    
    process.stdout.write('\n');
    console.log('\n开始输出---------------');
    console.log('摘要生成完成!');
    console.log('摘要长度:', combinedText.length);
    console.log('------------------------\n');

    return {
      finalSummary,
    };

  } catch (error) {
    console.error('Error processing webpage:', error);
    throw error;
  }
}
