const puppeteer = require('puppeteer');

// import puppeteer from 'puppeteer'
/**
 * 网页捕获工具 - 教学示例
 * @param {string} url 目标网页地址
 * @param {string} outputPath 输出文件路径
 * @param {'screenshot'|'pdf'} type 输出类型
 * @param {Object} [options] 可选配置项
 */



async function captureWebpage(url , type, options = {}) {
    // 启动浏览器：无头模式更高效，适合自动化操作
    const browser = await puppeteer.launch({ headless: true } );
    
    try {
        const page = await browser.newPage();
        
        // 设置视口：模拟设备尺寸，影响页面渲染效果
        await page.setViewport({
            width: 1280,
            height: 800,
            deviceScaleFactor: 1,
        });

        // 导航到目标页面：注意网络请求的处理方式
        await page.goto(url, {
            waitUntil: 'networkidle2', // 等待网络空闲
            timeout: 30000 // 超时时间
        });

        // 根据类型处理输出
        switch (type) {
            case 'screenshot':
                // 截图配置：fullPage参数实现长截图
               return await page.screenshot({
                  
                    fullPage: options.fullPage || true,
                    type: 'png',
                    ...options
                });
                 
                break;
                
            case 'pdf':
                // PDF生成：注意格式配置选项
                return  await page.pdf({
                  
                    format: 'A4',
                    printBackground: true, // 包含背景色
                    margin: {
                        top: '20mm',
                        right: '20mm',
                        bottom: '20mm',
                        left: '20mm'
                    },
                    ...options
                });
                break;
                
            default:
                throw new Error('无效的输出类型');
        }
        
    } catch (error) {
        console.error('操作失败:', error);
    } finally {
        // 确保关闭浏览器：避免资源泄漏
        await browser.close();
    }
}

// // 使用示例
// (async () => {
//     // 截图示例
//     const a= await captureWebpage(
//         'https://zhihu.com',
//         'screenshot',
//         { fullPage: false }
//     );
//     console.log("a",a);
    
//     return a
    
    
// })();
