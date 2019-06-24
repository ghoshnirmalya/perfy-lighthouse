import { Selector, ClientFunction } from "testcafe";

export const REACT_DELAY = 15000;

export const setCookie = ClientFunction(() => {
  document.cookie = "unexpected_redirect=new";
});

export const VisitNodeAppAsPlatformAdmin = async t => {
  await setCookie();
  await t
    .typeText(Selector("#user_email_or_login"), "btt_admin")
    .typeText(Selector("#user_password"), "Kmcdka09")
    .click(Selector("#new_user").find('[name="commit"]'));
  return t.wait(REACT_DELAY);
};

export const VisitNodeAppAsSiteAdmin = async t => {
  await setCookie();
  await t
    .typeText(Selector("#user_email_or_login"), "site_admin")
    .typeText(Selector("#user_password"), "Kmcdka09")
    .click(Selector("#new_user").find('[name="commit"]'));
  return t.wait(REACT_DELAY);
};

export const VisitNodeAppAsProjectAdmin = async t => {
  await setCookie();
  await t
    .typeText(Selector("#user_email_or_login"), "project_admin")
    .typeText(Selector("#user_password"), "Kmcdka09")
    .click(Selector("#new_user").find('[name="commit"]'));
  return t.wait(REACT_DELAY);
};

export const VisitNodeAppAsParticipant = async t => {
  await setCookie();
  await t
    .typeText(Selector("#user_email_or_login"), "participant")
    .typeText(Selector("#user_password"), "Kmcdka09")
    .click(Selector("#new_user").find('[name="commit"]'));
  return t.wait(REACT_DELAY);
};

export const is404 = async t => {
  const wrapper = Selector("#__next");
  const nextStatus = wrapper.find("h1");
  const nextStatusMsg = wrapper.find("h2");
  if (await wrapper.exists) {
    return t
      .expect(nextStatus.innerText)
      .eql("404")
      .expect(nextStatusMsg.innerText)
      .eql("This page could not be found.");
  }
  return t.eq(true, false); // Assertion fails, as page is not a NextJS generated Page...
};
