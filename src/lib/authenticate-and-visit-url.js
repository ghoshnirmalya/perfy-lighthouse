const authenticateAndVisitURL = async (page, loginURL, delay, URL) => {
  /**
   * Authenticate the user to visit an authenticated page
   */

  console.log(loginURL, delay, URL);

  await page.goto(loginURL, { waitUntil: "load" });
  await page.type("#user_email_or_login", "btt_admin");
  await page.type("#user_password", "Kmcdka09");
  await page.setCookie({ name: "unexpected_redirect", value: "new" });
  await page.$eval(".btn.btn-primary.js-submit", x => x.click());
  await page.waitFor(delay);
  await page.goto(URL, {
    waitUntil: "load"
  });
  await page.waitFor(delay);
};

module.exports = authenticateAndVisitURL;
