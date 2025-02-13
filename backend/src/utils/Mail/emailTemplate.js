import { sendMail2 } from "./sendMail2.js";

export const sendInvitationMail = async (email, data) => {
  const subject = "Invitation";
  const templateName = "invite";
  return sendMail2(email, subject, templateName, data);
};

export const sendPasswordSetupInvitation = async (email, data) => {
  const subject = "Password Setup";
  const templateName = "passwordSetFollowUp";
  return sendMail2(email, subject, templateName, data);
};
