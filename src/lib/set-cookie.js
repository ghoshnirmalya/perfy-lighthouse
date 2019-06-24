import { ClientFunction } from 'testcafe'

const setCookie = ClientFunction(() => {
  document.cookie = 'unexpected_redirect=new'
})

export default setCookie
