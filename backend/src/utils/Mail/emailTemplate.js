import { sendMail2 } from "./sendMail2.js";

export const sendInvitationMail = async (email, data) => {
  const subject = "Invitation";
  const templateName = "invite";
  return sendMail2(email, subject, templateName, data);
};
