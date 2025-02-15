
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain } from 'langchain/chains'
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// 1. 定义提示模板
const SUMMARY_PROMPT = `你是一个专业的网页内容分析师，请对以下网页内容进行分析和总结。

要求：
1. 生成一段简洁的摘要（100-150字）
2. 突出内容的核心价值和主要信息
3. 使用客观、专业的语气
4. 保持内容的准确性和完整性
5. 避免重复和冗余表达
6. 如果内容包含数据或统计信息，请在摘要中体现
7. 从你的视角来介绍这个网站
8. 尽量避免出现本文，本站，本网页等字样
9. 精炼摘要，不要出现重复的词，直达用户

分析维度：
- 内容主题和核心观点
- 重要数据和关键信息
- 网页的目的或意图
- 主要结论或建议

原文内容：
{text}

请直接输出摘要，无需其他格式或标记。`;


async function fetchWebpage(url: string) {
  try {

    // 1. URL 验证
    let formattedUrl = url;
    if (!url.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + url;
    }    
    
    const service = new HttpService();
    const response = await firstValueFrom(
      service.get(formattedUrl, {
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          // 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
          // // 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        },
      })
    );

  
    

    const $ = cheerio.load(response.data);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content');
    const keywords = $('meta[name="keywords"]').attr('content');
    const image = $('meta[property="og:image"]').attr('content');
    
    
    // 2. 移除所有干扰元素
    $('script, style, link, meta, noscript, iframe, video, audio, svg, canvas').remove();
    $('header, footer, nav, aside').remove();
    $('.header, .footer, .nav, .sidebar,.comments, .menu, .right-container, .advertisement').remove();
    $('[class*="comments"]').remove();
    $('[class*="wwads-cn wwads-horizontal"]').remove();

    // 3. 尝试找到主要内容区域
    const contentSelectors = [
      'fans',
      '#app',
      'article', '.article', '.post', '.content', '#content', 'main',
      'div[class*="content"]',
      'div[class*="fans"]',
     
      '#article', '.article-content', '.post-content', '#js_content',
      '#main', '#main-content', '#main-container', '#main-wrapper', '#main-area', '#main-content-area', '#main-content-container', '#main-content-wrapper',
     
    ];

    let mainContent = '';
     // 首先尝试从主要内容区域提取
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      const paragraphs = element.find('h1,h2,h3,h4,h5,h6,p,li')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => {
          // 增强过滤条件
          return text.length > 20 && // 增加最小长度阈值
            !/^[0-9\s]*$/.test(text) && // 排除纯数字
            !/^\s*$/.test(text) && // 排除空白内容
            !/^(Copyright|©|All rights reserved)/.test(text) && // 排除版权信息
            !/^(http|https):\/\//.test(text) && // 排除URL
            !/^[0-9a-zA-Z-_\.]+@[0-9a-zA-Z-_\.]+/.test(text); // 排除邮箱
        });
      
      if (paragraphs.length > 0) {
        mainContent = paragraphs.join('\n');
        break;
      }
    }
  }
    console.log('mainContent',mainContent);
    
    // return mainContent;
   
    
  
   

    // 5. 如果没找到主要内容，则提取所有段落
    if (!mainContent) {
      const paragraphs = $('body')
      .find('h1,h2,h3,h4,h5,h6,p,li')
      .filter((_, el) => {
        const $el = $(el);
        // 排除可能的导航、页脚等区域
        return !$el.parents('nav, header, footer, aside, .menu, .navigation').length;
      })
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 20);
    
    mainContent = paragraphs.join('\n');
    }
    console.log('mainContent',mainContent);

    // 6. 清理文本
    mainContent = mainContent
      .replace(/\s+/g, ' ')
      .replace(/[\n\r]+/g, '\n')
      .replace(/([。！？.!?])\1+/g, '$1')
      .trim();
  
    // 7. 分段并过滤
    let sections = mainContent
      .split(/\n+/)
    if (sections.length > 1) {
      sections=sections.filter(section => 
        section.length > 50 && // 只保留较长的段落
        !/^(Copyright|All rights reserved)/.test(section) && // 过滤版权信息
        !/[0-9a-zA-Z-_\.]+@[0-9a-zA-Z-_\.]+/.test(section) && // 过滤邮箱
        !section.includes('cookie') &&
        !section.includes('Cookie')
      );
    }
    console.log('sections',sections);
     
    return { sections: sections.slice(0, 5),
      meta: {
        title,
        description,
        keywords,
        image,
      }

     }; // 只返回前5个最长的段落

  } catch (error) {
    console.error('Error fetching webpage:', error);
    throw error;
  }
}

export async function parseWebPageForAI(url: string) {
  
  try {
    
    // return await fetchWebpage(url);
    const {sections,meta} = await fetchWebpage(url);
  
    if (!sections.length) {
      throw new Error('No valid content found');
    }


    // 合并所有段落为一个文本
    const combinedText = sections.join('\n\n');
    console.log('提取的文本长度:', combinedText.length);
    console.log('开始生成摘要...\n');

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


    // 流式输出最终结果
    const stream = await model.stream([
      {
        role: "system",

        content:`
你是一个专业的网页内容分析师，请对以下网页内容进行分析和总结，并提取出网页的多个关键/关联词。

要求：

生成一段简洁的摘要（100-150字），总结网站的核心内容。
摘要中要突出网站的核心价值、目的和主要信息。
采用客观、专业的语气，确保准确性和完整性，避免重复和冗余表达。
如果网站中包含数据或统计信息，请在摘要中体现。
从你的视角简洁地介绍该网站。
提取出网页中的多个关键词或关联词，确保能够准确反映网站的主题和主要内容。
分析维度：

内容主题和核心观点
重要数据和关键信息
网站创建的目的或意图
主要结论或建议
输出格式：

生成简洁的摘要（100-150字），能够帮助快速理解网站的核心内容。
在摘要后，列出网站的多个关键词和关联词，确保关键词能够有效代表网站的内容和目的。
示例：

摘要总结： 网站提供了一种简便的视频字幕编辑工具，用户可以上传视频并自动生成字幕。平台还提供编辑功能，支持自定义字幕样式与格式，并能够导出为不同的文件格式。该工具适合个人创作者和内容生产者，帮助提升视频的可访问性和观众体验。

关键词/关联词： 视频编辑、字幕生成、字幕工具、自动字幕、视频创作者、字幕自定义、文件导出、可访问性。`
    
      },
      {
        role: "user",
        content: `总结一下这个网站内容  ${result.text}`
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
    console.log('摘要长度:', result.text.length);
    console.log('------------------------\n');

    return {
      finalSummary: result.text,
      meta,
    };

  } catch (error) {
    console.error('Error processing webpage:', error);
    throw error;
  }
}
