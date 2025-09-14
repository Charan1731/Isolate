import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface EmailConfig {
  service: string;
  user: string;
  pass: string;
}

export interface InvitationEmailData {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  organizationName: string;
  invitationLink?: string;
}

class EmailService {
  private transporter: Transporter;

  constructor(config: EmailConfig) {
    this.transporter = nodemailer.createTransport({
      service: config.service,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error: any) {
      console.error('❌ Email service connection failed:');
      
      if (error.code === 'EAUTH') {
        console.error('🔐 Authentication Error: Invalid email credentials');
        console.error('📧 Make sure you are using:');
        console.error('   - Your Gmail address as EMAIL_USER');
        console.error('   - Gmail App Password (not regular password) as EMAIL_PASS');
        console.error('   - 2-Factor Authentication enabled on your Gmail account');
        console.error('🔗 Setup guide: https://support.google.com/accounts/answer/185833');
      } else if (error.code === 'ENOTFOUND') {
        console.error('🌐 Network Error: Cannot reach email server');
        console.error('   - Check your internet connection');
        console.error('   - Verify EMAIL_SERVICE setting');
      } else {
        console.error('❓ Unknown error:', error.message);
      }
      
      return false;
    }
  }

  async sendInvitationEmail(data: InvitationEmailData): Promise<boolean> {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: data.recipientEmail,
        subject: `Invitation to join ${data.organizationName}`,
        html: this.generateInvitationTemplate(data),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Invitation email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return false;
    }
  }

  private generateInvitationTemplate(data: InvitationEmailData): string {
    const recipientName = data.recipientName || 'there';
    const invitationLink = data.invitationLink || '#';

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>Join ${data.organizationName} on Isolate</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap');
          
          /* Client-specific Styles */
          #outlook a { padding: 0; }
          .ReadMsgBody { width: 100%; }
          .ExternalClass { width: 100%; }
          .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height: 100%; }
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; }

          /* Reset styles */
          img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          table { border-collapse: collapse !important; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

          /* iOS Blue Links */
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }

          /* Gmail Blue Links */
          u + #body a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }

          /* Samsung Mail Blue Links */
          #MessageViewBody a {
            color: inherit;
            text-decoration: none;
            font-size: inherit;
            font-family: inherit;
            font-weight: inherit;
            line-height: inherit;
          }

          /* Main Styles */
          body {
            font-family: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            min-height: 100vh;
          }

          .email-wrapper {
            background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
            padding: 40px 20px;
            min-height: 100vh;
          }

          .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.97);
            backdrop-filter: blur(20px);
            border-radius: 24px;
            border: 2px solid rgba(255, 255, 255, 0.1);
            box-shadow: 
              0 25px 50px -12px rgba(0, 0, 0, 0.4),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            overflow: hidden;
            position: relative;
          }

          .email-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          }

          .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            padding: 40px 32px;
            text-align: center;
            position: relative;
            overflow: hidden;
          }

          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: 
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.03) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.03) 0%, transparent 50%);
          }

          .logo-container {
            position: relative;
            z-index: 2;
            margin-bottom: 16px;
          }

          .logo {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
            border-radius: 16px;
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.2);
            position: relative;
          }

          .logo::before {
            content: '📝';
            font-size: 24px;
          }

          .brand-name {
            position: relative;
            z-index: 2;
            font-size: 32px;
            font-weight: 700;
            background: linear-gradient(135deg, #ffffff 0%, #e0e0e0 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin: 0;
            letter-spacing: -0.02em;
          }

          .tagline {
            position: relative;
            z-index: 2;
            color: rgba(255, 255, 255, 0.7);
            font-size: 14px;
            font-weight: 500;
            margin: 8px 0 0 0;
            letter-spacing: 0.05em;
          }

          .content {
            padding: 48px 32px;
            background: rgba(255, 255, 255, 0.98);
            position: relative;
          }

          .invitation-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .invitation-title {
            font-size: 32px;
            font-weight: 700;
            color: #1a1a1a;
            margin: 0 0 12px 0;
            letter-spacing: -0.02em;
            line-height: 1.2;
          }

          .invitation-subtitle {
            font-size: 18px;
            color: #6b7280;
            margin: 0;
            font-weight: 500;
          }

          .greeting {
            font-size: 18px;
            color: #374151;
            margin: 0 0 24px 0;
            font-weight: 500;
          }

          .invitation-text {
            font-size: 16px;
            color: #4b5563;
            line-height: 1.6;
            margin: 0 0 32px 0;
          }

          .invitation-text strong {
            color: #1f2937;
            font-weight: 600;
          }

          .highlight-box {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            margin: 32px 0;
            position: relative;
            overflow: hidden;
          }

          .highlight-box::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 1px;
            background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
          }

          .highlight-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin: 0 0 8px 0;
            display: flex;
            align-items: center;
          }

          .highlight-title::before {
            content: '✨';
            margin-right: 8px;
            font-size: 18px;
          }

          .highlight-text {
            font-size: 15px;
            color: #4b5563;
            margin: 0;
            line-height: 1.5;
          }

          .cta-container {
            text-align: center;
            margin: 40px 0;
          }

          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: #ffffff !important;
            text-decoration: none;
            font-weight: 600;
            font-size: 16px;
            padding: 16px 32px;
            border-radius: 12px;
            box-shadow: 
              0 8px 25px rgba(31, 41, 55, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease;
            position: relative;
            overflow: hidden;
            letter-spacing: 0.01em;
          }

          .cta-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
            transition: left 0.5s ease;
          }

          .cta-button:hover::before {
            left: 100%;
          }

          .cta-button span {
            position: relative;
            z-index: 2;
          }

          .fallback-link {
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 20px;
            margin: 32px 0;
            text-align: center;
          }

          .fallback-text {
            font-size: 14px;
            color: #6b7280;
            margin: 0 0 12px 0;
            font-weight: 500;
          }

          .fallback-url {
            font-size: 14px;
            color: #3b82f6;
            word-break: break-all;
            font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
            background: #ffffff;
            padding: 12px 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin: 0;
          }

          .support-text {
            font-size: 15px;
            color: #6b7280;
            line-height: 1.6;
            margin: 32px 0 0 0;
            text-align: center;
          }

          .footer {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            padding: 32px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }

          .footer-text {
            font-size: 13px;
            color: #6b7280;
            line-height: 1.5;
            margin: 0 0 8px 0;
          }

          .footer-disclaimer {
            font-size: 12px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.4;
          }

          /* Dark mode support */
          @media (prefers-color-scheme: dark) {
            .email-container {
              background: rgba(31, 41, 55, 0.95);
              border-color: rgba(75, 85, 99, 0.3);
            }
            
            .content {
              background: rgba(31, 41, 55, 0.98);
            }
            
            .invitation-title {
              color: #f9fafb;
            }
            
            .invitation-subtitle {
              color: #d1d5db;
            }
            
            .greeting {
              color: #e5e7eb;
            }
            
            .invitation-text {
              color: #d1d5db;
            }
            
            .invitation-text strong {
              color: #f3f4f6;
            }
            
            .highlight-box {
              background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
              border-color: #6b7280;
            }
            
            .highlight-title {
              color: #f9fafb;
            }
            
            .highlight-text {
              color: #d1d5db;
            }
            
            .fallback-link {
              background: #374151;
              border-color: #4b5563;
            }
            
            .fallback-text {
              color: #d1d5db;
            }
            
            .fallback-url {
              background: #4b5563;
              border-color: #6b7280;
              color: #93c5fd;
            }
            
            .support-text {
              color: #d1d5db;
            }
            
            .footer {
              background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
              border-color: #6b7280;
            }
            
            .footer-text {
              color: #d1d5db;
            }
            
            .footer-disclaimer {
              color: #9ca3af;
            }
          }

          /* Mobile Responsive */
          @media screen and (max-width: 600px) {
            .email-wrapper {
              padding: 20px 16px;
            }
            
            .email-container {
              border-radius: 20px;
            }
            
            .header {
              padding: 32px 24px;
            }
            
            .brand-name {
              font-size: 28px;
            }
            
            .content {
              padding: 32px 24px;
            }
            
            .invitation-title {
              font-size: 28px;
            }
            
            .invitation-subtitle {
              font-size: 16px;
            }
            
            .cta-button {
              padding: 14px 28px;
              font-size: 15px;
            }
            
            .footer {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-wrapper">
          <div class="email-container">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <div class="logo"></div>
              </div>
              <h1 class="brand-name">Isolate</h1>
              <p class="tagline">Secure Notes</p>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="invitation-header">
                <h2 class="invitation-title">You're Invited!</h2>
                <p class="invitation-subtitle">Join ${data.organizationName} and start collaborating</p>
              </div>
              
              <p class="greeting">Hello ${recipientName},</p>
              
              <p class="invitation-text">
                <strong>${data.senderName}</strong> has invited you to join <strong>${data.organizationName}</strong> on Isolate. 
                Start creating secure notes and collaborating with your team in a safe, encrypted environment.
              </p>
              
              <div class="highlight-box">
                <p class="highlight-title">What's next?</p>
                <p class="highlight-text">
                  Click the button below to accept your invitation and set up your account. 
                  You'll be able to create notes, collaborate with team members, and manage your workspace.
                </p>
              </div>
              
              <div class="cta-container">
                <a href="${invitationLink}" class="cta-button">
                  <span>Accept Invitation & Get Started</span>
                </a>
              </div>
              
              <div class="fallback-link">
                <p class="fallback-text">If the button above doesn't work, copy and paste this link into your browser:</p>
                <p class="fallback-url">${invitationLink}</p>
              </div>
              
              <p class="support-text">
                If you have any questions or need help getting started, feel free to reach out to 
                <strong>${data.senderName}</strong> or our support team. We're here to help!
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <p class="footer-text">
                This invitation was sent by <strong>${data.senderName}</strong> on behalf of <strong>${data.organizationName}</strong>
              </p>
              <p class="footer-disclaimer">
                If you didn't expect this invitation, you can safely ignore this email. 
                Your email address will not be added to any mailing lists.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

let emailService: EmailService | null = null;

export const getEmailService = (): EmailService => {
  if (!emailService) {
    const config: EmailConfig = {
      service: process.env.EMAIL_SERVICE || 'gmail',
      user: process.env.EMAIL_USER || '',
      pass: process.env.EMAIL_PASS || '',
    };
    
    // Validate configuration
    if (!config.user || !config.pass) {
      console.error('⚠️  Email service configuration incomplete:');
      console.error('   Missing EMAIL_USER or EMAIL_PASS in environment variables');
      console.error('   Email invitations will not work until configured properly');
    }
    
    emailService = new EmailService(config);
  }
  return emailService;
};

export default EmailService;
