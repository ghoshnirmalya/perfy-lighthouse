const authenticateAndVisitURL = async (
  page,
  delay,
  url,
  login_url,
  username_or_email_address_field_selector,
  username_or_email_address_field_value,
  password_field_selector,
  password_field_value,
  submit_button_selector
) => {
  /**
   * Authenticate the user to visit an authenticated page
   */
  await page.goto(login_url, { waitUntil: 'load' })
  await page.type(
    username_or_email_address_field_selector,
    username_or_email_address_field_value
  )
  await page.type(password_field_selector, password_field_value)
  await page.setCookie({ name: 'unexpected_redirect', value: 'new' })
  await page.$eval(submit_button_selector, x => x.click())
  await page.waitFor(delay)
  await page.goto(url, {
    waitUntil: 'networkidle0',
  })
  await page.waitFor(delay)
}

module.exports = authenticateAndVisitURL
