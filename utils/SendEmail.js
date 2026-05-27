import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "OTP Verification",

    html: `
      <h2>Your OTP Code</h2>
      <h1>${otp}</h1>
      <p>OTP valid for 5 minutes.</p>
    `,
  });
};

export default sendEmail;
