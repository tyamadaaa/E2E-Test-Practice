'use strict';

const puppeteer = require('puppeteer');
process.on('unhandledRejection', console.dir);

(async() => {
  const browser = await puppeteer.launch({
    headless: false,
    'ignoreHTTPSErrors' : true,
    'slowMo' : 200,
    args: [
      '--window-size=1600,950',
      '--window-position=100,50',
      '--no-sandbox'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({width: 1600, height: 950});

  try {
    await page.goto('https://www.google.co.jp', {waitUntil: 'networkidle2', timeout: 5000});
    await page.waitFor('input[name=q]');
    await page.type('input[name=q]', process.argv[2]);   
    await page.keyboard.press('Enter');
    await page.waitForSelector('h3 a', {waitUntil: 'networkidle2', timeout: 2500});
    await page.waitFor(1500);

    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('h3 a'));
      return anchors.map(anchor => anchor.textContent);
    });
    console.log(links.join('\n'));

    let linkElmList = await page.$$('h3.r a');
    let target = getRandomArbitary(0, 4);
    await linkElmList[target].click({waitUntil: 'networkidle2', timeout: 2500});
    await page.waitFor(3000);
  }
  catch (e) {
    console.log(e);
    await browser.close();
    process.exit(200);
  }
  await browser.close();
})();

function getRandomArbitary(min, max) {
  return Math.floor( Math.random() * (max - min + 1) ) + min;
}