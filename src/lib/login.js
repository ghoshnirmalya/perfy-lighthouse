import setCookie from "./set-cookie";
import { REACT_DELAY, credentials } from "../config";
import User from "./user";

const user = new User();

module.exports = {
  loginAsPlatformAdmin: async t => {
    await setCookie();
    await user.login(
      t,
      credentials.platformAdmin.username,
      credentials.platformAdmin.password
    );

    return t.wait(REACT_DELAY);
  },
  loginAsSiteAdmin: async t => {
    await setCookie();
    await user.login(
      t,
      credentials.siteAdmin.username,
      credentials.siteAdmin.password
    );

    return t.wait(REACT_DELAY);
  },
  loginAsProjectAdmin: async t => {
    await setCookie();
    await user.login(
      t,
      credentials.projectAdmin.username,
      credentials.projectAdmin.password
    );

    return t.wait(REACT_DELAY);
  },
  loginAsParticipant: async t => {
    await setCookie();
    await user.login(
      t,
      credentials.participantAdmin.username,
      credentials.participant.password
    );

    return t.wait(REACT_DELAY);
  }
};
