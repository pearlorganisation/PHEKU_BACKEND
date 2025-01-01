import nodemailer, { createTransport } from "nodemailer";

export const sendMail = (email, resetLink) => {
  const transporter = createTransport({
    host: "smtp.gmail.com",
    port: 465,
    service: "gmail",
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASS,
    },
  });

  let mailOptions = {
    from: process.env.NODEMAILER_MAIL,
    to: email,
    subject: "Create a new Password",
    html: resetLink,
  };

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return reject(error);
      } else {
        return resolve("Mail sent Successfully");
      }
    });
  });
};
