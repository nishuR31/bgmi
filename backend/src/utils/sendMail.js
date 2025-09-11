import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL, // Gmail address
    pass: process.env.MAIL_PASS, // Gmail App Password
  },
});

export const mail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: `XGround <${process.env.MAIL}>`, // keep this consistent
      to,
      subject,
      text,
      html,
    });

    console.log("Email sent: %s", info.messageId);
    return info;
  } catch (err) {
    console.error("Error sending email:", err);
    throw err;
  }
};

// export const send = (info, time) => {
//   setInterval(async () => {
//     try {
//       await mail(info);
//     } catch (err) {
//       console.error("Scheduled mail failed:", err);
//     }
//   }, time);
// };
