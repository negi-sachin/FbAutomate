const puppeteer = require("puppeteer");
const process = require("process");
//config file contains emailId/phone number and password
const config = require("./config");
//number :Top {number} posts will get liked
const number = parseInt(process.argv[2]);
const site = "https://www.facebook.com/";

(async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      timeout: 0,
      args: ["--start-maximized"],
      slowMo: 100,
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });
    const context = browser.defaultBrowserContext();
    context.overridePermissions(site, []);
    await page.goto(site, { waitUntil: "networkidle2" });
    //waiting for email id box to appear,then focusing on it and start typing
    await page.waitForSelector("input[id='email']");
    await page.focus("input[id='email']");
    await page.keyboard.type(config.email);
    await page.focus("input[id='pass']");
    await page.keyboard.type(config.password);
    //clicking login button
    await page.click('#u_0_b');
    //"div._666k a" is parent of like button,therefore waiting for it
    await page.waitForSelector("div._666k a");
    let divsNumber = await page.$$eval("div._666k a", (divs) => divs.length);

    //looping and waiting till total like buttons in dom are not greater or equal to {number}
    while (divsNumber <= number) {
      for (let i = 0; i <= 50; i++) await page.keyboard.press("ArrowDown");
      divsNumber = await page.$$eval("div._666k a", (divs) => divs.length);
    }

    //passing {number} to dom
    await page.evaluate((number) => {
      //if we miss to give {number} in our cli ,then it will not like any post and simply return
      if (isNaN(number)) {
        return;
      }
      //function for delay between clicking two consecutive like button
      function delay(time) {
        return new Promise(function (resolve) {
          setTimeout(resolve, time);
        });
      }
      //function for clicking like button
      async function LikePost() {
        for (let i = 0; i < likeBtn.length; i++) {
          likeBtn[i].focus();
          await delay(500);
          likeBtn[i].click();
          await delay(1000);
        }
      }

      let likeBtn = [...document.querySelectorAll("div._666k a")].slice(
        0,
        number
      );
      LikePost();
    }, number);
    //waiting for browser to manually close
    await page.waitFor(() => false);

    await browser.close();
  } catch (e) {
    console.log("error", e);
  }
})();
