export const resetPasswordTemplate = (resetLink: string) => `
<h1>Reset Your Password</h1>
<p>You have requested to reset your password.</p>
<p>Please click the button below to set a new password:</p>
<p>
  <a href="${resetLink}" style="display: inline-block; background-color: #2196F3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
    Reset Password
  </a>
</p>
<p>If the button doesn't work, you can also click on this link or copy and paste it into your browser:</p>
<p><a href="${resetLink}">${resetLink}</a></p>
<p>If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
<p>This link will expire in 24 hours.</p>
<p>Best regards,<br>Your App Team</p>
`;
