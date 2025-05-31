"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailTemplate = void 0;
const verifyEmailTemplate = (firstName, verificationLink) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
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
    .verification-box {
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-circle">AI</div>
      </div>
      <h1>Verify Your Email Address</h1>
      <div class="ai-pattern"></div>
    </div>
    
    <div class="content">
      <p>Hello <span class="highlight">${firstName}</span>,</p>
      
      <p>Thank you for joining our AI-powered platform! To ensure the security of your account and unlock all features, please verify your email address.</p>
      
      <div style="text-align: center;">
        <a href="${verificationLink}" class="button">Verify My Email</a>
      </div>
      
      <div class="verification-box">
        <p><strong>Security Notice:</strong> If you didn't create an account with us, please disregard this email.</p>
        
        <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
        
        <p><a href="${verificationLink}" class="link">${verificationLink}</a></p>
        
        <p class="expiry-notice">This verification link will expire in 24 hours for security reasons.</p>
      </div>
      
      <p>After verification, you'll have full access to all our AI-enhanced features designed to make your experience more intuitive and personalized.</p>
      
      <div class="ai-pattern"></div>
      
      <p>Need help? Our AI-assisted support team is available 24/7 to answer your questions.</p>
    </div>
    
    <div class="footer">
      <p>With warm regards,<br>The AI Platform Team</p>
      <div class="social-links">
        <a href="#">Twitter</a> • <a href="#">LinkedIn</a> • <a href="#">Facebook</a>
      </div>
      <p>© 2024 AI Platform. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
exports.verifyEmailTemplate = verifyEmailTemplate;
//# sourceMappingURL=verify-email.template.js.map