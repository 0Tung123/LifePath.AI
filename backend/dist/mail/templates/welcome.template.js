"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.welcomeTemplate = void 0;
const welcomeTemplate = (firstName) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Platform</title>
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">
        <div class="logo-circle">AI</div>
      </div>
      <h1>Welcome to Our AI-Powered Platform</h1>
      <div class="ai-pattern"></div>
    </div>
    
    <div class="content">
      <p>Hello <span class="highlight">${firstName}</span>,</p>
      
      <p>We're thrilled to welcome you to our innovative platform! Your journey into the future of AI-enhanced experiences begins now.</p>
      
      <p>Here's what you can look forward to:</p>
      <ul>
        <li>Personalized AI recommendations tailored to your preferences</li>
        <li>Cutting-edge tools designed for maximum efficiency</li>
        <li>A seamless, intuitive interface built with you in mind</li>
      </ul>
      
      <p>Our team has crafted every aspect of this experience to help you achieve more with less effort. We're constantly evolving and improving based on user feedback and the latest advancements in AI technology.</p>
      
      <p>If you have any questions or need assistance, our support team is always ready to help.</p>
      
      <div class="ai-pattern"></div>
      
      <p>Ready to explore? <span class="highlight">Log in now to get started!</span></p>
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
exports.welcomeTemplate = welcomeTemplate;
//# sourceMappingURL=welcome.template.js.map