
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { LLMChain, SequentialChain } from 'langchain/chains'
import * as cheerio from 'cheerio';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { OpenAPIObject } from '@nestjs/swagger';
interface meta{
   sections:string[]
  meta: {
    title:string,
    description:string,
    keywords:string,
    image:string,
    logo:string
  }
}

// 1. 定义提示模板
const SUMMARY_PROMPT = `你是一个专业的网页内容分析师，先根据你已有的经验判断的功能类型，然后请对以下网页内容进行分析和总结，并提取出网页的多个关键/关联词。

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


生成简洁的摘要（100字以内），能够帮助快速理解网站的核心内容。
在摘要后，列出网站的多个关键词和关联词，确保关键词能够有效代表网站的内容和目的。
原文内容：{text}
示例：

摘要总结： 网站提供了一种简便的视频字幕编辑工具，用户可以上传视频并自动生成字幕。平台还提供编辑功能，支持自定义字幕样式与格式，并能够导出为不同的文件格式。该工具适合个人创作者和内容生产者，帮助提升视频的可访问性和观众体验。

关键词/关联词： 视频编辑、字幕生成、字幕工具、自动字幕、视频创作者、字幕自定义、文件导出、可访问性。`
 
const OptimizeSummary=`作为专业文本内容优化引擎 文本是文章或者网页的总结性摘要，请按以下要求处理文本：

# 优化方向
1. 逻辑结构 - 确保因果关系明确，段落间有过渡衔接
2. 信息密度 - 删除冗余描述，保留核心事实/数据/结论
3. 可读性 - 将复杂句式拆分为短句，保持口语化表达
4. 关键词 - 理解原文和关键词的关联,提取，扩展，创造3-5个实体名词和技术术语（非通用词）
# 输入内容
{synopsis}

# 输出格式
# 摘要内容
[用中文输出优化后的专业摘要，150字以内]

# 关键词推荐
[使用「丨」分隔关键词，按重要性排序，示例：量子计算丨神经网络丨异构集成]

# 强制要求
❌ 禁止添加解释性文字
❌ 禁止改变原文技术细节
✅ 保留原始数据精确性
`


async function getLogo(url,$) {
  // 尝试缓存
  const domain = new URL(url).hostname;
  
  // 策略1: 尝试直接获取favicon.ico
  try {
    const faviconUrl = `https://${domain}/favicon.ico`;
    const service = new HttpService();
    await service.head(faviconUrl); // 检查是否存在
   
    return faviconUrl;
  } catch {}

  // 策略2: 解析HTML查找link标签
  try {
    const icons = [];
    $('link[rel*="icon"]').each((i, el) => {
      const href = $(el).attr('href');
      const sizes = $(el).attr('sizes') || '16x16';
      const size = Math.max(...sizes.split(' ').map(s => parseInt(s)));
      icons.push({ href: new URL(href, url).toString(), size });
    });

    if (icons.length > 0) {
      // 选择最大尺寸的图标
      const bestIcon = icons.sort((a,b) => b.size - a.size)[0].href;
      return bestIcon;
    }
  } catch {}
  // 策略3: 使用Google服务
  const googleIcon = `https://www.google.com/s2/favicons?domain=${domain}`;
  return googleIcon;
}
export async function fetchWebpage(url: string):Promise<meta>  {
  try {
    console.log(url);
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
        },
      })
      
    );
    const $ = cheerio.load(response.data);
    
    // 使用多种选择器提取标题
    const title = $('title').text() || 
                 $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') || 
                 $('h1').first().text();
    
    // 使用多种选择器提取描述
    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content');
    
    // 使用多种选择器提取关键词
    const keywords = $('meta[name="keywords"]').attr('content') || 
                    $('meta[name="news_keywords"]').attr('content') || 
                    $('meta[property="article:tag"]').attr('content');
    
    // 使用多种选择器提取图片
    const image = $('meta[property="og:image"]').attr('content') || 
                 $('meta[name="twitter:image"]').attr('content') || 
                 $('link[rel="image_src"]').attr('href') || 
                 $('img[itemprop="image"]').attr('src');
    const logo = await getLogo(url,$);
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
    return { sections: sections.slice(0, 5),
      meta: {
        title,
        description,
        keywords,
        image,
        logo
      }
     }; // 只返回前5个最长的段落

  } catch (error) {
    console.error('Error fetching webpage:', error);
    throw error;
  }
}
export async function parseWebPageForAI(url: string,modelobject:Modelobject) {
   const model = new ChatOpenAI({
    modelName: modelobject.modelName||"deepseek-v3",
    temperature: 0.3,
    maxTokens: 2046,
    openAIApiKey: modelobject.openAIApiKey||process.env.ARK_API_KEY,
    configuration: {
      baseURL: modelobject.baseURL||'https://dashscope.aliyuncs.com/compatible-mode/v1',
    },
  });
  try {
    const { sections, meta } = await fetchWebpage(url);
    if (!sections.length) {
      throw new Error('No valid content found');
    }
    const combinedText = `${sections.join('\n')}+${JSON.stringify(meta)}`;
    const summaryChain = new LLMChain({
      llm: model,
      prompt: new PromptTemplate({
        template: SUMMARY_PROMPT,
        inputVariables: ["text"]
      }),
      outputKey: "synopsis" 
    });

    const optimizeChain = new LLMChain({
      llm: model,
      prompt: new PromptTemplate({
        template: OptimizeSummary,
        inputVariables: ["synopsis"] 
      }),
      outputKey: "review"
    });

    // 创建顺序链（关键修改点）
    const overallChain = new SequentialChain({
      chains: [summaryChain, optimizeChain],
      inputVariables: ["text"], 
      outputVariables: ["synopsis", "review"], 
      verbose: true
    });

   
    const { review: finalSummary } = await overallChain.call({
      text: combinedText 
    });
    return {
      finalSummary,
      meta
    };
  } catch (error) {
    console.error('网页处理错误:', error);
    throw error;
  }
}
