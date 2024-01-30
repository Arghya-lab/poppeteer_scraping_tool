const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { executablePath } = require("puppeteer");

(async () => {
  // Add the Stealth plugin
  puppeteer.use(StealthPlugin());
  // Add adblocker plugin to block all ads and trackers (saves bandwidth)
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 424, height: 782 });
  // await page.setViewport({ width: 1440, height: 870 });

  //        LOGIN         //
  // Navigate the page to a URL
  await page.goto("https://twitter.com/", {
    waitUntil: "domcontentloaded",
  });
  await page.waitForTimeout(5000);

  await page.waitForSelector('[data-testid="loginButton"]');
  await page.click('[data-testid="loginButton"]');

  await page.waitForTimeout(15000);
  // await page.waitForSelector('[autocomplete="username"]');
  // await page.type('[autocomplete="username"]', "arghyamaity403@gmail.com");
  await page.waitForSelector('input');
  await page.type('input', "arghyamaity403@gmail.com");
  // await page.click('[data-viewportview="true"] > div > div > div:nth-child(6)');
  await page.click('[role="button"]:nth-child(6)');

  await page.waitForTimeout(4000);
  await page.type(
    'input',
    "7'j(2WGM3L>Q|=o(.?:_vZ!.J_/>#$Gtd,Mv`h0;"
  );
  // await page.click(
  //   '[role="group"]'
  // );
  await page.click(
    '[aria-disabled="true"]'
  );

  console.log("successfully login to the account");
  await page.waitForTimeout(7000);

  await page.goto("https://twitter.com/docm77", {
    waitUntil: "domcontentloaded",
  });

  await page.waitForSelector('article [data-testid="tweet"]')
  const tweets = await page.$$eval(
    'article [data-testid="tweet"]',
    (articles) => articles
  );

  fs.appendFile("article.txt", JSON.stringify(tweets), (e) => {
    if (e) console.log(e);
  });

  // await browser.close();
  console.log("job done");
})();
