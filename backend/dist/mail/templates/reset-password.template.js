"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordTemplate = void 0;
const resetPasswordTemplate = (resetLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background: linear-gradient(145deg, #ffffff, #f5f7ff);
      border-radius: 15px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 1px solid #eaeaea;
      margin-bottom: 20px;
    }
    .logo {
      margin-bottom: 15px;
    }
    .logo-circle {
      display: inline-block;
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      border-radius: 50%;
      text-align: center;
      line-height: 60px;
      color: white;
      font-weight: bold;
      font-size: 24px;
    }
    h1 {
      color: #333;
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
    }
    .content {
      padding: 20px 0;
    }
    p {
      margin-bottom: 15px;
      color: #555;
    }
    .highlight {
      color: #6e8efb;
      font-weight: 600;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: linear-gradient(135deg, #6e8efb, #a777e3);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      margin: 20px 0;
      box-shadow: 0 4px 10px rgba(110, 142, 251, 0.3);
      transition: all 0.3s ease;
    }
    .button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(110, 142, 251, 0.4);
    }
    .security-box {
      background-color: #f0f4ff;
      border-radius: 10px;
      padding: 20px;
      margin: 20px 0;
      border-left: 4px solid #6e8efb;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eaeaea;
      margin-top: 20px;
      color: #999;
      font-size: 14px;
    }
    .social-links {
      margin-top: 15px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #6e8efb;
      text-decoration: none;
    }
    .ai-pattern {
      height: 5px;
      background: linear-gradient(90deg, #6e8efb, #a777e3, #6e8efb);
      border-radius: 5px;
      margin: 15px 0;
    }
    .link {
      color: #6e8efb;
      text-decoration: none;
      word-break: break-all;
    }
    .expiry-notice {
      font-size: 14px;
      color: #888;
      font-style: italic;
      margin-top: 15px;
    }
    .security-icon {
      font-size: 24px;
      margin-right: 10px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-circle">AI</div>
      </div>
      <h1>Reset Your Password</h1>
      <div class="ai-pattern"></div>
    </div>
    
    <div class="content">
      <p>Hello,</p>
      
      <p>We received a request to reset your password for your account on our AI Platform. Our intelligent security system has processed this request and generated a secure reset link for you.</p>
      
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset My Password</a>
      </div>
      
      <div class="security-box">
        <p><span class="security-icon">🔒</span><strong>Security Notice:</strong></p>
        
        <p>If you did not request this password reset, please ignore this email or contact our support team immediately as your account may have been targeted.</p>
        
        <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        
        <p><a href="${resetLink}" class="link">${resetLink}</a></p>
        
        <p class="expiry-notice">For your security, this password reset link will expire in 24 hours.</p>
      </div>
      
      <p>After resetting your password, you'll be able to log in with your new credentials and continue enjoying our AI-enhanced features.</p>
      
      <div class="ai-pattern"></div>
      
      <p>Our AI-powered security system continuously monitors for unusual activity to keep your account safe. We recommend using a strong, unique password that you don't use on other websites.</p>
    </div>
    
    <div class="footer">
      <p>With warm regards,<br>The AI Platform Security Team</p>
      <div class="social-links">
        <a href="#">Twitter</a> • <a href="#">LinkedIn</a> • <a href="#">Facebook</a>
      </div>
      <p>© 2024 AI Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
exports.resetPasswordTemplate = resetPasswordTemplate;
//# sourceMappingURL=reset-password.template.js.map