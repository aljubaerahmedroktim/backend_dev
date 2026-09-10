const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),

  secure: process.env.SMTP_SECURE === "true",

  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendEmail = async (data) => {
  const { to, subject, text, html } = data;

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });
};

const sendPasswordResetEmail = async (data) => {
  const { email, resetUrl } = data;

  await sendEmail({
    to: email,
    subject: "Reset your password",
    text: `You requested a password reset.

        Reset your password using this link: 

        ${resetUrl}

        This link will expire soon.

        If you did not request this, please ignore this email.
        `,
    html: `<h2>Password Reset</h2>

            <p>
                You requested a password reset.
            </p>

            <p>
                Click the link below:
            </p>

            <a href="${resetUrl}">
                Reset Password
            </a>

            <p>
                If you did not request this,
                you can safely ignore this email.
            </p>`,
  });
};

const sendVerificationEmail = async (data) => {
  const { email, verificationUrl } = data;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    text: `
    Welcome!
    
    Please verify your email address:

    ${verificationUrl}

    This link will expire in 10 minutes.
    `,
    html: `
    <h2>Verify Your Email</h2>

    <p>
        Thank you for registering.
    </p>

    <p>
        Click the link below to verify
        your email address.
    </p>

    <a href="${verificationUrl}">
        Verify Email
    </a>

    <p>
        This link will expire in 10 minutes.
    </p>
    `,
  });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendVerificationEmail };
