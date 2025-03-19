import puppeteer, { Browser, Page } from 'puppeteer';

// 智能等待策略
const waitForCriticalElements = async (page: Page) => {
  const checks = [
    page.waitForSelector('body', { timeout: 5000 }),
    page.waitForSelector('title', { timeout: 5000 }).catch(() => {}),
    page.waitForResponse(res => 
      res.status() === 200 && res.request().resourceType() === 'document',
      { timeout: 10000 }
    )
  ];
  await Promise.race(checks);
};

// 改进的渲染函数
export const renderFullPage = async (browser: Browser, url: string) => {
  const page = await browser.newPage();
  
  // 配置网络监控
  await page.setRequestInterception(true);
  page.on('request', req => {
    const blocked = ['image', 'font', 'media', 'stylesheet'];
    blocked.includes(req.resourceType()) ? req.abort() : req.continue();
  });

  try {
    // 分阶段加载
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    // 等待关键内容
    await waitForCriticalElements(page);
    
    // 执行前端hydration检测
    // await page.evaluate(async () => {
    //   const isSPA = () => window.angular || window.__NEXT_DATA__;
    //   if (isSPA()) await new Promise(res => setTimeout(res, 2000));
    // });

    // 获取完整HTML
    const html = await page.content();
    const cleanedHtml = html
      .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '');
      
    return cleanedHtml;
  } finally {
    await page.close();
  }
};

 