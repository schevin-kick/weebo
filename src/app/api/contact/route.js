import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { publicRateLimit, getIdentifier, checkRateLimit, createRateLimitResponse } from '@/lib/ratelimit';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Bot protection constants
const MIN_FORM_TIME_MS = 2000; // Minimum 2 seconds to fill form (bots are faster)
const MAX_MESSAGE_LENGTH = 400;

/**
 * POST /api/contact
 * Handle contact form submissions with bot protection
 */
export async function POST(request) {
  try {
    // Apply rate limiting (10 requests per 10 minutes per IP)
    const identifier = getIdentifier(request);
    const rateLimitResult = await checkRateLimit(publicRateLimit, identifier);

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const data = await request.json();
    const { name, email, message, website, timestamp } = data;

    // Bot Protection 1: Honeypot field check
    // If the "website" field is filled, it's likely a bot
    if (website && website.trim() !== '') {
      console.warn('[Contact Form] Honeypot triggered:', { identifier });
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    // Bot Protection 2: Time-based validation
    // Check if form was submitted too quickly (< 2 seconds)
    const timeElapsed = Date.now() - timestamp;
    if (timeElapsed < MIN_FORM_TIME_MS) {
      console.warn('[Contact Form] Form submitted too quickly:', {
        identifier,
        timeElapsed: `${timeElapsed}ms`,
      });
      return NextResponse.json(
        { error: 'Invalid submission' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate name (basic sanitization)
    const sanitizedName = name.trim();
    if (sanitizedName.length === 0 || sanitizedName.length > 100) {
      return NextResponse.json(
        { error: 'Invalid name' },
        { status: 400 }
      );
    }

    // Validate email format
    const sanitizedEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Validate message length
    const sanitizedMessage = message.trim();
    if (sanitizedMessage.length === 0 || sanitizedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be between 1 and ${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      );
    }

    // Check for environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const contactEmailTo = process.env.CONTACT_EMAIL_TO;

    if (!gmailUser || !gmailAppPassword || !contactEmailTo) {
      console.error('[Contact Form] Missing email configuration environment variables');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    // Email content
    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ec4899 100%);
      color: white;
      padding: 30px;
      border-radius: 10px 10px 0 0;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .content {
      background: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 10px 10px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 5px;
    }
    .field-value {
      color: #1f2937;
      font-size: 16px;
      padding: 10px;
      background: white;
      border-radius: 5px;
      border: 1px solid #e5e7eb;
    }
    .message-box {
      white-space: pre-wrap;
      word-wrap: break-word;
    }
    .footer {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      color: #6b7280;
      font-size: 12px;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>✉️ New Contact Form Submission</h1>
  </div>
  <div class="content">
    <div class="field">
      <div class="field-label">From</div>
      <div class="field-value">${sanitizedName}</div>
    </div>
    <div class="field">
      <div class="field-label">Email</div>
      <div class="field-value">
        <a href="mailto:${sanitizedEmail}" style="color: #f97316; text-decoration: none;">
          ${sanitizedEmail}
        </a>
      </div>
    </div>
    <div class="field">
      <div class="field-label">Message</div>
      <div class="field-value message-box">${sanitizedMessage}</div>
    </div>
    <div class="footer">
      Sent from Kitsune Contact Form<br>
      ${new Date().toLocaleString('en-US', {
        dateStyle: 'full',
        timeStyle: 'long',
        timeZone: 'UTC'
      })}
    </div>
  </div>
</body>
</html>
    `.trim();

    // Plain text version (fallback)
    const emailText = `
New Contact Form Submission

From: ${sanitizedName}
Email: ${sanitizedEmail}

Message:
${sanitizedMessage}

---
Sent from Kitsune Contact Form
${new Date().toISOString()}
    `.trim();

    // Send email
    await transporter.sendMail({
      from: `"Kitsune Contact Form" <${gmailUser}>`,
      to: contactEmailTo,
      replyTo: sanitizedEmail,
      subject: `Contact Form: Message from ${sanitizedName}`,
      text: emailText,
      html: emailHtml,
    });

    console.log('[Contact Form] Email sent successfully:', {
      from: sanitizedEmail,
      name: sanitizedName,
    });

    // Return success response
    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('[Contact Form] Error:', error);

    // Check for specific nodemailer errors
    if (error.code === 'EAUTH') {
      console.error('[Contact Form] Gmail authentication failed. Check GMAIL_USER and GMAIL_APP_PASSWORD');
      return NextResponse.json(
        { error: 'Email service authentication failed' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to send message. Please try again later.' },
      { status: 500 }
    );
  }
}
