const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
// const AdblockerPlugin = require('puppeteer-extra-plugin-adblocker')
const { executablePath } = require("puppeteer");

(async (searchQuery = "kolkata restaurents", itemTargetCount = 20) => {
  // Add the Stealth plugin
  puppeteer.use(StealthPlugin());
  // Add adblocker plugin to block all ads and trackers (saves bandwidth)
  // puppeteer.use(AdblockerPlugin({ blockTrackers: true }))

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    // headless: "new",
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  // Set screen size
  await page.setViewport({ width: 1440, height: 1024 });

  // Navigate the page to a URL
  await page.goto("https://www.google.com/maps", {
    waitUntil: "domcontentloaded",
  });
  // page.waitForTimeout(5000);

  // Filling input using page.type()
  await page.type("#searchboxinput", searchQuery);
  await page.waitForTimeout(20000);
  await page.click("#searchbox-searchbutton");

  // Wait for navigation to occur after pressing Enter
  // await page.waitForNavigation({ waitUntil: "domcontentloaded" });
  await page.waitForTimeout(20000);

  let itemCount = 0;

  while (itemTargetCount > itemCount) {
    // Fetch data from the page context
    await page.evaluate(() => {
      const items = document.querySelectorAll("div .section-subtitle-extension");
      itemCount = Array.from(items).length

      Array.from(items).forEach((item) => {
        const place = item.parentElement
        const placeData = place.lastElementChild
        
        const type = placeData.firstElementChild.firstElementChild.textContent.trim().replace(/,/g, "") || null
        const name = place.querySelector("div .fontHeadlineSmall").textContent.trim().replace(/,/g, "") || null
        const rating = place.querySelector("div .fontBodyMedium").firstElementChild.firstElementChild.textContent || null
        const totalRating = place.querySelector("div .fontBodyMedium").firstElementChild.lastElementChild.textContent.replace(/[(),]/g, "") || null
        const address = placeData.firstElementChild.lastElementChild.textContent.trim().replace(/,/g, "") || null
        const mobileNo = placeData.lastElementChild.lastElementChild.lastElementChild.textContent.trim().replace(/,/g, "") || null
        
        // fs.appendFile("mapLeads.csv", `${type},${name},${rating},${totalRating},${address},${mobileNo}`, (e) => {
        //   if (e) console.log(e);
        // });
        console.log(`${type},${name},${rating},${totalRating},${address},${mobileNo}`);
      });
    });

    const previousHeight = await page.evaluate(() => document.querySelector("div[role='feed']").scrollHeight);
    await page.evaluate(() => {
      const feedElement = document.querySelector("div[role='feed']");
      if (feedElement) {
        feedElement.scrollTo(0, feedElement.scrollHeight);
      }
    });
    
    await page.waitForFunction(()=>document.querySelector("div[role='feed']").scrollHeight>previousHeight);
  
    // Add a delay before fetching more data
    await page.waitForTimeout(1000);
  }

  // await browser.close();
  console.log("job done");
})();
