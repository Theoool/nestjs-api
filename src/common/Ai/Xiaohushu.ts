// const Puppeteer = require('puppeteer');
import Puppeteer from 'passport'

async function crawlXiaohongshu(postUrl) {
    try {
        const browser = await Puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        await page.goto(postUrl, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });
        
        await page.waitForSelector('.note-content', { timeout: 10000 });
        console.log(page);
        
        const title = await page.title();
        const author = await page.$eval('span.username', el => el.textContent);
        const mainTextSpan = await page.$('div#detail-desc span.note-text span');
        const contentText = await mainTextSpan.evaluate(el => el.textContent);
        const hashtagElements = await page.$$('div#detail-desc span.note-text a');
        const hashtags = await Promise.all(hashtagElements.map(el => el.evaluate(e => e.textContent)));
        const dateLocation = await page.$eval('span.date', el => el.textContent);
        const [dateStr, location] = dateLocation.split(' ');
        const [month, day] = dateStr.split('-');
        const publishDate = `2025-${month}-${day}`;
        const imageUrls = await page.$$eval('.media-container img[data-xhs-img]', imgTags => imgTags.map(img => img.getAttribute('src')));
        await expandAllComments(page);
        const comments = await page.$$eval('div.comment-item', commentElements => {
            return commentElements.map(commentEl => {
                const author = commentEl.querySelector('a.name').textContent;
                const text = commentEl.querySelector('span.note-text').textContent;
                const likeCount = commentEl.querySelector('span.count').textContent;
                return { author, text, likes: parseInt(likeCount) };
            });
        });
        comments.sort((a, b) => b.likes - a.likes);
        const hotComments = comments.slice(0, 5);
        const metaTags = await page.$$eval('meta', metaTags => metaTags.map(tag => {
            return {
                name: tag.getAttribute('name') || tag.getAttribute('property'),
                content: tag.getAttribute('content')
            };
        }));
        
        await browser.close();
         console.log({
          title,
          author,
          publishDate,
          location,
          content: contentText,
          hashtags,
          images: imageUrls,
          hotComments,
          seo: metaTags
      });
         
        return {
            title,
            author,
            publishDate,
            location,
            content: contentText,
            hashtags,
            images: imageUrls,
            hotComments,
            seo: metaTags
        };
    } catch (error) {
        console.error('爬取失败:', error);
        throw error;
    }
}

async function expandAllComments(page) {
    while (true) {
        const showMoreButtons = await page.$$('div.show-more');
        if (showMoreButtons.length === 0) break;
        await Promise.all(showMoreButtons.map(button => button.click()));
        await page.waitForTimeout(1000);
    }
}
export default crawlXiaohongshu;
