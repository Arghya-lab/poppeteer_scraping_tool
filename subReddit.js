const fs = require("fs");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
const { executablePath } = require("puppeteer");
const { input } = require("@inquirer/prompts");

const sleepFor = async (page, min, max) => {
  const sleepDuration = Math.floor(Math.random() * (max - min) + min);
  await page.waitForTimeout(sleepDuration);
};

const fetchSubRedditInfo = async (page) => {
  await page.waitForSelector("shreddit-subreddit-header");
  await page.waitForSelector("#position faceplate-number");
  await page.waitForSelector(
    `faceplate-expandable-section-helper > details > summary > [noun="rules"] > li > div > span > span:nth-child(2)`
  );
  await page.waitForSelector(`ul [role="presentation"]`);

  const subRedditInfo = await page.evaluate(() => {
    const headerContainer = document.querySelector("shreddit-subreddit-header");
    const subReddit = headerContainer.getAttribute("name").trim();
    const displayName = headerContainer.getAttribute("display-name").trim();
    const description = headerContainer.getAttribute("description").trim();
    const members = headerContainer.getAttribute("subscribers");
    const rankBySize = headerContainer
      .querySelector("#position faceplate-number")
      .getAttribute("number");
    const rules = Array.from(
      document.querySelectorAll(
        `faceplate-expandable-section-helper > details > summary > [noun="rules"] > li > div > span > span:nth-child(2)`
      )
    ).map((e) => e?.innerText || "");
    // const moderators = Array.from(
    //   document.querySelectorAll(`li [role="presentation"]`)
    // )
    //   .filter((e) => e?.innerText.startsWith("u/"))
    //   .map((e) => e?.innerText || "");
    // moderator only works when user is online

    return {
      subReddit,
      displayName,
      description,
      members,
      rankBySize,
      rules,
      // moderators,
    };
  });

  return subRedditInfo;
};

const fetchPosts = async (page) => {
  const posts = await page.evaluate(() => {
    const postContainer = document.querySelectorAll("shreddit-post");

    const postData = Array.from(postContainer).map((post) => {
      const author = post.getAttribute("author").trim();
      // const author = post
      //   .querySelector(`[slot="authorName"]`)
      //   .textContent.trim()
      //   .substring(2);
      const title =
        post.querySelector(`[slot="title"]`)?.textContent.trim() || "";
      const content =
        post
          .querySelector(`[slot="text-body"]`)
          ?.textContent.split("\n")
          .map((text) => text.trim())
          .join("\n")
          .replace(/^\n+|\n+$/g, "") // Remove leading and trailing newlines
          .replace(/\n+/g, "\n") || // Replace consecutive newlines with a single newline
        "";
      const videoLink = post.querySelector(`shreddit-player`)?.src || "";
      const imgLink =
        post.querySelector(`img [role="presentation"]`)?.src || "";

      return { author, title, content, media: { imgLink, videoLink } };
    });
    return postData;
  });
  return posts;
};

async function fetchRedditPosts(postTargetCount = 20, subReddit) {
  if (!postTargetCount || postTargetCount < 10) postTargetCount = 10;
  if (postTargetCount > 50) postTargetCount = 50;

  // Add the Stealth plugin
  puppeteer.use(StealthPlugin());
  // Add adblocker plugin to block all ads and trackers (saves bandwidth)
  puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

  // Launch the browser and open a new blank page
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: executablePath(),
  });

  let pageUrl = subReddit
    ? `https://www.reddit.com/r/${subReddit}`
    : `https://www.reddit.com`;

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Navigate the page to a URL & wait for 1-2 sec randomly
  await page.goto(pageUrl, { waitUntil: "networkidle2" });
  await sleepFor(page, 1000, 2000);

  let subRedditInfo;
  let posts = [];

  if (subReddit) {
    subRedditInfo = await fetchSubRedditInfo(page);
  }

  while (postTargetCount >= posts.length) {
    posts = await fetchPosts(page);

    // implement scroll
    await sleepFor(page, 1000, 2000);

    page.evaluate(() => {
      window.scrollBy(0, window.innerHeight);
    });

    await sleepFor(page, 1000, 5000);
  }

  const data = { subRedditInfo, posts };

  fs.writeFile(
    `subRedditPosts-${Date.now()}.out.json`,
    JSON.stringify(data),
    (e) => {
      if (e) console.log(e);
    }
  );

  await browser.close();
  console.log("Job is done.....");
}

(async () => {
  // get user input
  let subReddit = await input({
    message: "Enter sub reddit name(or leave empty to get feed posts):",
  });
  let postCount = await input({
    message: "Enter total post count to fetch(you can leave empty):",
  });
  fetchRedditPosts(postCount, subReddit);
})();
