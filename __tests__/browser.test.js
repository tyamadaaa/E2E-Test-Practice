const puppeteer = require('puppeteer');

describe('Google Search Test', () => {
    let page, browser;
    const option = {
        headless: false,
        slowMo: 150,
        args: [
            '--window-size=1600,950',
            '--window-position=100,50',
            '--no-sandbox'
        ]
    };

    beforeEach (async () => {
        browser = await puppeteer.launch();
        page = await browser.newPage();
        await page.goto('https://www.google.co.jp');
    });

    afterEach (async () => {
        await browser.close();
    }); 

    test('should visit Google', async () => {
        expect(await page.title()).toEqual('Google');
    });

    test('should have search bar', async () => {
        expect(await page.waitFor('input[name=q]'))
        .toBeCalled;
    });

    test('should click search bar', async () => {
        expect(await page.click('input[name=q]'))
        .toBeCalled;
    });

    test('should type hello in the search bar', async () => {
        await page.waitFor('input[name=q]');
        expect(await page.$eval('input[name=q]', el => el.value = 'hello'))
        .toHaveLength(5);
    });

    test('should press submit button', async () => {
        expect(await page.keyboard.press('Enter'))
        .toBeCalled;
    });

    test('should wait before redirecting', async () => {
        await page.waitFor('input[name=q]');
        await page.$eval('input[name=q]', el => el.value = 'hello');
        expect(await Promise.all( [
            page.keyboard.press('Enter'),
            page.waitForNavigation({waitUntil : 'networkidle2'}),
        ]
    )).toBeCalled;
    });

    test('should redirect to hello', async () => {
        await page.waitFor('input[name=q]');
        await page.$eval('input[name=q]', el => el.value = 'hello');
        await page.keyboard.press('Enter');
        await page.waitForNavigation({waitUntil : 'networkidle2'})
        await page.waitForSelector('input#lst-ib')
        const result = await page.evaluate(() => {
            return document.getElementById('lst-ib').value
        });
        expect(result).toContain('hello');
    });

    test('should close browser when nothing typed', async () => {
        await page.waitFor('input[name=q]');
        await page.$eval('input[name=q]', el => el.value = null);
        expect(await browser.close())
        .toBeCalled;
    });

    test('should show Youtube link in hello result', async () => {
        await page.waitFor('input[name=q]');
        await page.$eval('input[name=q]', el => el.value = 'hello');
        await page.keyboard.press('Enter');
        await page.waitForSelector('.r');
        const Youtube = await page.evaluate(() => {
            return document.querySelector('.r').innerText;
        });
        expect(Youtube).toContain('Adele - Hello - YouTube');
    });  

    test('Youtube link should work in hello result', async () => {
        await page.waitFor('input[name=q]');
        await page.$eval('input[name=q]', el => el.value = 'hello');
        await page.keyboard.press('Enter');
        await page.waitForSelector('.r');
        const Youtube = '#rso > div:nth-child(1) > div > div.kp-blk.'+
        'c14z5c.Wnoohf.OJXvsb > div > div.ifM9O > div:nth-child(2) >'+
        'div.kp-header > div > div > div > div > div.FGpTBd > h3 > a';
        await page.click(Youtube);
        page.on('response', async (response) => {
            const code = response.status;
            expect(code).toBe(200);
        });
    });
});