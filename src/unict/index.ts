import OpenAI from 'openai';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import { firstValueFrom } from 'rxjs';
import { Cheerio } from 'cheerio';
import { SummarizerManager } from 'node-summarizer';
const openai = new OpenAI({
  apiKey: process.env['ARK_API_KEY'],
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});


async function getSummary(text: string) {
  try {
      const Summarizer = new SummarizerManager(text, 5); // 5 表示句子数量
      const summary = await Summarizer.getSummaryByRank();
      return summary;
  } catch (error) {
      console.error('摘要生成失败:', error);
      return text; // 如果摘要失败，返回原文
  }
}

async function fetchWebContent(url: string): Promise<string> {
  const httpService = new HttpService();
  
  try {
    const response = await firstValueFrom(
      httpService.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      })
    );

    const $ = cheerio.load(response.data);
    
    // 1. 移除干扰元素
    $('script, style, link, meta, noscript, iframe, img').remove();

    // 2. 计算每个元素的文本密度和得分
    const blocks: Array<{ element: Cheerio<any>; score: number }> = [];
    
    $('body *').each((_, element) => {
      const $element = $(element);
      
      // 跳过隐藏元素
      if ($element.css('display') === 'none' || $element.css('visibility') === 'hidden') {
        return;
      }

      // 计算文本密度
      const text = $element.text().trim();
      const textLength = text.length;
      const childrenCount = $element.children().length || 1;
      const density = textLength / childrenCount;
      
      // 计算得分
      let score = density;

      // 根据标签类型调整得分
      const tag = element.tagName.toLowerCase();
      if (['article', 'main', 'section', 'div'].includes(tag)) {
        score *= 1.5;
      }
      if (['p', 'h1', 'h2', 'h3'].includes(tag)) {
        score *= 2;
      }
      if ($element.text().length > 100) {
        score *= 2;
      }
      if ($element.children().length > 1) {
        score *= 1.5;
      }
      if ($element.text().length < 10) {
        score *= 0.5;
      }


      // 根据位置调整得分（页面中间的内容得分更高）
      const position = 0; // 移除 offset() 调用
      const pageHeight = 1000; // 使用固定值
      const positionScore = 1 - Math.abs(0.5 - position / pageHeight);
    
      score *= (1 + positionScore);

      // 存储得分大于阈值的块
      if (score > 10 && textLength > 100) {
        blocks.push({ element: $element.clone(), score });
      }
    });


    

    // 3. 按得分排序并提取内容
    blocks.sort((a, b) => b.score - a.score);
    // console.log(blocks.map(block => block.element.text()));
        // return $.html();
    // console.log(encodeURIComponent($.text()));
    // console.log($('html *').text());

 
    // 4. 获取得分最高的几个块的内容
    let content = blocks
      .slice(0, 5)  // 取得分最高的5个块
      .map(block => block.element.text().trim())
      .join('\n\n');

    // 5. 如果没有找到高分块，退化到基本提取
    if (!content) {
      content = $('body')
        .clone()    // 克隆以避免修改原始DOM
        .children() // 获取所有子元素
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => text.length > 100)  // 只保留长文本
        .join('\n\n');
    }

    // 6. 清理文本
    const cleanContent = content
      .replace(/\s+/g, ' ')        // 合并空格
      .replace(/\n\s*\n/g, '\n')   // 删除多余空行
      .replace(/([。！？.!?])\1+/g, '$1') // 删除重复的标点
      .split(/\n+/)                // 分割成段落
      .filter(p => p.length > 50)  // 只保留长段落
      .join('\n')
      .trim();
     
      const summary = await getSummary(cleanContent);

    return  summary as string;

  } catch (error) {
    console.error('提取内容失败:', error);
    throw new Error(`Failed to extract content: ${error.message}`);
  }
}


async function parseWebPageForAI(url:string) {
  try {

    const webContent = await fetchWebContent(url);
   console.log(webContent);
   
    // 2. 生成摘要提示词
    const prompt = `
请对以下内容生成一段简洁的概述性摘要：
- 摘要长度控制在130字以内
- 突出核心要点和主要信息
- 使用客观的语气
- 保持内容的准确性
- 避免重复和冗余表达
- 提取内容的主要观点和关键信息
- 确保概述简洁明了，突出重点
- 不要使用“本文”、“文章”等词汇
- 不要使用“以下是摘要”、“摘要如下”等词汇


原文内容：
${webContent}

请直接输出摘要，无需其他格式或标记。
`;

  
    // // 5. 流式输出版本（可选）
    console.log('\n----- 流式输出版本 -----')
    // const stream = await openai.chat.completions.create({
    //   messages: [
    //     { role: 'system', content: '你是一个专业的文本摘要助手，善于提取文章重点，生成准确简洁的摘要。' },
    //     { role: 'user', content: prompt },
    //   ],
    //   model: 'ep-20241102134011-258bh',
    //   stream: true,
    // });

    // process.stdout.write('流式摘要：\n');
    // for await (const part of stream) {
    //   process.stdout.write(part.choices[0]?.delta?.content || '');
    // }
    // process.stdout.write('\n');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

export default parseWebPageForAI;
