import puppeteer from 'puppeteer'
export async function  puPNG(){
  const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://news.ycombinator.com', {
  waitUntil: 'networkidle2',
});
const a= await page.screenshot({
  path: 'hn.png',
});

await browser.close();

return a
}
