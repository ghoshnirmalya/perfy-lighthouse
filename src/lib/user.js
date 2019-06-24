import { Selector } from 'testcafe'

export default class User {
  constructor () {
    this.usernameInput = Selector('#user_email_or_login')
    this.passwordInput = Selector('#user_password')
    this.submitButton = Selector('#new_user [name="commit"]')
  }

  async login (t, username, password) {
    await t
      .typeText(this.usernameInput, username)
      .typeText(this.passwordInput, password)
      .click(this.submitButton)
  }
}
