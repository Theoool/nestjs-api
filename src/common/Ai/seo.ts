import { PromptTemplate } from '@langchain/core/prompts';
import { ChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { HttpService } from '@nestjs/axios';
import * as cheerio from 'cheerio';
import { LLMChain } from 'langchain/chains';
import { firstValueFrom } from 'rxjs';
import { Readable } from 'stream';
import { fetchWebpage } from '../../common';
// 导入角色定义模块（假设存在）
import { getRolePrompt, seoRoles } from './seoRoles';

interface SEOEssentials {
  titles: {
    h1: string[];
    h2: string[];
  };
  meta: {
    title: string;
    description: string;
    robots: string;
  };
  keywords: string[];
  links: {
    internal: string[];
    external: string[];
  };
  media: {
    images: Array<{ alt?: string; src: string }>;
  };
  content?: string[];
}

interface CompressedData {
  m: {
    t: string | null;
    d: string | null;
    r: string | null;
  };
  h: {
    1: string[];
    2: string[];
  };
  k: string[];
  l: {
    i: string[];
    e: string[];
  };
  i: Array<{ a: string | null; s: string }>;
  c?: string[];
}

export function extractSeoEssentials(html: string): SEOEssentials {
  const $ = cheerio.load(html);

  // 移除无效内容
  $('script, style, iframe, noscript').remove();
  $('*[data-ignore-seo]').remove();
  $('script, style, noscript, iframe, video, audio, svg, canvas').remove();
  $('.nav, .sidebar, .comments, .menu, .right-container, .advertisement').remove();
  $('[class*="comments"]').remove();
  $('[class*="wwads-cn wwads-horizontal"]').remove();

  // 提取文章内容
  let articleContent: string[] = [];
  const contentSelectors = [
    'article', '.article', '.post', '.content', '#content', 'main',
    'div[class*="content"]', '#article', '.article-content', '.post-content', '#js_content',
    '#main', '#main-content', '.main', '.main-content', 'fans', '#app',
    'div[class*="fans"]'
  ];

  let mainContent = '';
  for (const selector of contentSelectors) {
    const element = $(selector);
    if (element.length > 0) {
      const paragraphs = element.find('h1,h2,h3,h4,h5,h6,p,li')
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(text => {
          return text.length > 20 &&
            !/^[0-9\s]*$/.test(text) &&
            !/^\s*$/.test(text) &&
            !/^(Copyright|©|All rights reserved)/i.test(text) &&
            !/^(http|https):\/\//.test(text) &&
            !/^[0-9a-zA-Z-_\.]+@[0-9a-zA-Z-_\.]+/.test(text);
        });
      if (paragraphs.length > 0) {
        mainContent = paragraphs.join('\n');
        break;
      }
    }
  }

  if (!mainContent) {
    const paragraphs = $('body')
      .find('h1,h2,h3,h4,h5,h6,p,li')
      .filter((_, el) => !$(el).parents('nav, header, footer, aside, .menu, .navigation').length)
      .map((_, el) => $(el).text().trim())
      .get()
      .filter(text => text.length > 20);
    mainContent = paragraphs.join('\n');
  }

  mainContent = mainContent
    .replace(/\s+/g, ' ')
    .replace(/[\n\r]+/g, '\n')
    .replace(/([。！？.!?])\1+/g, '$1')
    .trim();

  if (mainContent) {
    articleContent = mainContent
      .split(/\n+/)
      .filter(section =>
        section.length > 50 &&
        !/^(Copyright|All rights reserved)/i.test(section) &&
        !/[0-9a-zA-Z-_\.]+@[0-9a-zA-Z-_\.]+/.test(section) &&
        !section.toLowerCase().includes('cookie')
      )
      .slice(0, 5);
  }

  return {
    titles: {
      h1: $('h1').map((i, el) => $(el).text().trim()).get(),
      h2: $('h2').map((i, el) => $(el).text().trim()).get()
    },
    meta: {
      title: $('title').text().trim(),
      description: $('meta[name="description"]').attr('content') || '',
      robots: $('meta[name="robots"]').attr('content') || 'index,follow'
    },
    keywords: $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [],
    links: {
      internal: $('a[href^="/"], a[href^="http://localhost"]')
        .map((i, el) => $(el).attr('href')).get(),
      external: $('a[href^="http"]:not([href*="localhost"])')
        .map((i, el) => $(el).attr('href')).get()
    },
    media: {
      images: $('img').map((i, el) => ({
        alt: $(el).attr('alt'),
        src: $(el).attr('src')
      })).get()
    },
    content: articleContent.length > 0 ? articleContent : undefined
  };
}

function compressSeoData(data: SEOEssentials): CompressedData {
  return {
    m: {
      t: data.meta.title || null,
      d: data.meta.description || null,
      r: data.meta.robots !== 'index,follow' ? data.meta.robots : null
    },
    h: {
      1: data.titles.h1,
      2: data.titles.h2
    },
    k: data.keywords,
    l: {
      i: [...new Set(data.links.internal)],
      e: [...new Set(data.links.external)]
    },
    i: data.media.images.map(img => ({
      a: img.alt || null,
      s: img.src
    })),
    c: data.content
  };
}

export function buildStablePrompt(data: CompressedData, roleName: string = 'contentMarketing') {
  try {
    return getRolePrompt(roleName, data);
  } catch (error) {
    console.warn(`角色 ${roleName} 不存在，使用默认提示`);
    const meta = [
      `标题:${truncate(data.m.t, 60)}`,
      `描述:${truncate(data.m.d, 160)}`,
      `Robots:${data.m.r}`
    ].filter(Boolean).join(' | ');

    const sections = [
      `H1:[${data.h[1].join(';')}]`,
      `H2:[${data.h[2].join(';')}]`,
      data.k.length && `关键词:${data.k.join(',')}`,
      data.l.i.length && `内链:${sample(data.l.i, 5).join(',')}`,
      data.l.e.length && `外链:${sample(data.l.e, 3).join(',')}`,
      data.i.length && `图片:${data.i.filter(img => !img.a).length}缺失ALT`
    ].filter(Boolean).join('\n');

    const contentSection = data.c && data.c.length > 0
      ? `\n\n## 文章内容\n${data.c.join('\n\n')}`
      : '';

    return `
    ## 分析要求
    <role-description> 您是一位专业的 AI 内容策略师和作家，专注于创建高效、针对 SEO 优化的文章。
    您的专业知识涵盖关键字研究、内容结构、引人入胜的写作和实施 SEO 最佳实践。
    您通过集思广益新鲜的内容创意、制定全面的大纲和制作精美的文章来协助用户，这些文章既在搜索引擎中排名靠前，
    又为人类读者提供真正的价值。您可以根据用户的行业、目标受众和特定内容目标调整您的方法。
    </role-description>
    
    ## 页面数据
    ${meta}
    
    ${sections}${contentSection}
    `;
  }
}

function truncate(str: string, max: number) {
  return str && str.length > max ? str.slice(0, max - 3) + '...' : str || '';
}

function sample(arr: string[], n: number) {
  return arr.slice(0, n).concat(arr.length > n ? ['...'] : []);
}

export async function SEO(url: string) {
  let formattedUrl = url;
  if (!url.match(/^https?:\/\//i)) {
    formattedUrl = 'https://' + url;
  }
  const service = new HttpService();
  try {
    const response = await firstValueFrom(
      service.get(formattedUrl, {
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        timeout: 10000, // 添加超时
      })
    );

    const seoData = extractSeoEssentials(response.data);

    if (!seoData.content || seoData.content.length === 0) {
      try {
        console.log('使用备选方案提取文章内容...');
        const { sections } = await fetchWebpage(url);
        if (sections && sections.length > 0) {
          seoData.content = sections;
        }
      } catch (error) {
        console.warn('备选方案提取文章内容失败:', error);
      }
    } else {
      console.log(`成功提取文章内容: ${seoData.content.length} 段落`);
    }

    const data = compressSeoData(seoData);
    return data;
  } catch (error) {
    console.error('SEO 数据提取失败:', error);
    throw error;
  }
}

export async function parseSeoAi(url: string, 
  roleName: string = 'contentMarketing', modelobject:Modelobject) {
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
   
    const data = await SEO(url);
    console.log('SEO Data:', JSON.stringify(data, null, 2)); // 调试输出
    console.log('Model initialized with API key:', process.env.ARK_API_KEY); // 调试输出

    
    const promptTemplate = new PromptTemplate({
      template: buildStablePrompt(data, roleName),
      inputVariables: [], // 移除多余的 text 变量，直接嵌入数据
    });
    const summaryChain = new LLMChain({
      llm: model,
      prompt: promptTemplate,
    });
    console.log('Prompt:', promptTemplate.template); // 调试输出

    // Step 4: 启动流式输出
    const webStream = await summaryChain.stream({});
    console.log('Stream initialized'); // 调试输出

    // Step 5: 使用 TransformStream 处理流式数据
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        try {
          // 调整 chunk 处理逻辑以适配可能的多种数据结构
          const rawData = chunk?.content ??
                         chunk?.choices?.[0]?.delta?.content ??
                         chunk?.text ??
                         chunk?.data ?? ''; // 增加 chunk?.data 以适配可能的格式
          console.log('Chunk received:', rawData); // 调试输出

          if (!rawData) {
            return; // 跳过空数据
          }

          const buffer = [];
          for (const char of rawData) {
            buffer.push(char);
            if (buffer.length >= 15 || /[。！？.!?]/.test(char)) {
              controller.enqueue(buffer.join(''));
              buffer.length = 0;
              await new Promise(resolve => setTimeout(resolve, 30));
            }
          }
          if (buffer.length > 0) {
            controller.enqueue(buffer.join(''));
          }

          // 移除 controller.terminate()，让流自然结束
        } catch (e) {
          console.error('分块处理失败:', e);
          controller.enqueue('[处理错误]');
        }
      },
    });

    // Step 6: 将 Web Stream 转换为 Node.js Readable Stream
    return Readable.fromWeb(webStream.pipeThrough(transformStream));
  } catch (error) {
    console.error("网页处理错误:", error);
    throw error;
  }
}

export function getAvailableSeoRoles() {
  return Object.entries(seoRoles).map(([key, role]) => ({
    id: key,
    name: role.name,
    description: role.description
  }));
}
