export const verifyEmailTemplate = (
  firstName: string,
  verificationLink: string,
) => `
<h1>Verify Your Email</h1>
<p>Dear ${firstName},</p>
<p>Thank you for registering with us. Please verify your email address by clicking the button below:</p>
<p>
  <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    Verify Email
  </a>
</p>
<p>If the button doesn't work, you can also click on this link or copy and paste it into your browser:</p>
<p><a href="${verificationLink}">${verificationLink}</a></p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>Your App Team</p>
`;
