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
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invitation to ${data.organizationName}</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            margin-top: 20px;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #007bff;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #007bff;
            margin: 0;
            font-size: 28px;
          }
          .content {
            padding: 20px 0;
          }
          .content h2 {
            color: #333;
            margin-bottom: 20px;
          }
          .content p {
            margin-bottom: 15px;
            font-size: 16px;
          }
          .cta-button {
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .cta-button:hover {
            background-color: #0056b3;
          }
          .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #eee;
            margin-top: 30px;
            color: #666;
            font-size: 14px;
          }
          .highlight {
            background-color: #e7f3ff;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.organizationName}</h1>
          </div>
          
          <div class="content">
            <h2>You're Invited!</h2>
            
            <p>Hello ${recipientName},</p>
            
            <p><strong>${data.senderName}</strong> has invited you to join <strong>${data.organizationName}</strong>.</p>
            
            <div class="highlight">
              <p><strong>What's next?</strong></p>
              <p>Click the button below to accept your invitation and get started with your team.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="cta-button">Accept Invitation</a>
            </div>
            
            <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #007bff;">${invitationLink}</p>
            
            <p>If you have any questions, feel free to reach out to ${data.senderName} or our support team.</p>
            
            <p>Welcome aboard!</p>
          </div>
          
          <div class="footer">
            <p>This invitation was sent by ${data.senderName} on behalf of ${data.organizationName}</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
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
