// import  {genericPool}  from 'generic-pool';
const genericPool = require("generic-pool");

import puppeteer, { Browser, Page } from 'puppeteer';


// 浏览器实例配置
const browserConfig = {
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox']
};

// 智能连接池实现
export const createBrowserPool = (max = 5, min = 2) => {
  return genericPool.createPool({
    create: () => puppeteer.launch(browserConfig),
    destroy: (browser) => browser.close()
  }, { max, min });
};

// 页面渲染函数
export const renderPage = async (pool: any, url: string) => {
  const browser = await pool.acquire();
  const page = await browser.newPage();
  try {
    await page.setRequestInterception(true);
    page.on('request', req => {
      ['image', 'media'].includes(req.resourceType()) ? req.abort() : req.continue();
    });
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 15000 
    });
    
     
    return {
      html: await page.content(),
      metrics: await page.metrics()
    };
  } finally {
   
    await page.close();
    pool.release(browser);
  }
};
