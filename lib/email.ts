import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM_EMAIL = 'Career Journey <noreply@hrpassionguy.com>' // Update with your verified domain

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Base email sender
export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const data = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text: text || stripHtml(html),
    })
    
    return { success: true }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}
}

// Welcome email after signup
export async function sendWelcomeEmail(
  email: string,
  fullName: string,
  assessmentUrl: string
) {
  return sendEmail({
    to: email,
    subject: 'Welcome to Your Career Journey! 🚀',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .button { 
              background-color: #2563eb; 
              color: white; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              display: inline-block;
              margin: 20px 0;
            }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Welcome, ${fullName}! 👋</h1>
            
            <p>I'm Marcus Holmes, the HR Passion Guy, and I'm excited to guide you through your career transformation.</p>
            
            <p>You've just taken the first step toward landing the role you deserve. Here's what happens next:</p>
            
            <ol>
              <li><strong>Take Your Career Breakthrough Assessment</strong> - Discover exactly what's blocking your progress (5 minutes)</li>
              <li><strong>Get Your Personalized Action Plan</strong> - I'll send you a custom roadmap based on your results</li>
              <li><strong>Choose Your Journey</strong> - Unlock the modules that match your goals</li>
            </ol>
            
            <a href="${assessmentUrl}" class="button">Start Your Assessment Now →</a>
            
            <p><strong>What you'll discover:</strong></p>
            <ul>
              <li>Your biggest career obstacle (and how to overcome it)</li>
              <li>Your "Career Breakthrough Type"</li>
              <li>3 specific next steps tailored to your situation</li>
            </ul>
            
            <p>I've helped hundreds of professionals land $100K+ roles, negotiate 20%+ salary increases, and pivot into dream careers. You're next.</p>
            
            <p>Let's do this,<br>
            Marcus R. Holmes, SHRM-CP, PHR<br>
            <em>The HR Passion Guy</em></p>
            
            <div class="footer">
              <p>Questions? Reply to this email - I read every message.</p>
              <p>Career Journey by HR Passion LLC</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

// Assessment results email
export async function sendAssessmentResultsEmail(
  email: string,
  fullName: string,
  breakthroughType: string,
  dashboardUrl: string
) {
  return sendEmail({
    to: email,
    subject: `Your Results: You're a "${breakthroughType}" 🎯`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1>Your Career Breakthrough Results</h1>
            
            <p>Hi ${fullName},</p>
            
            <p>Based on your assessment, <strong>you're a ${breakthroughType}</strong>.</p>
            
            <p>I've created a personalized action plan in your dashboard with specific next steps for your situation.</p>
            
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              View Your Full Results →
            </a>
            
            <p><strong>Your Next Steps:</strong></p>
            <p>I've unlocked your personalized career journey dashboard. Inside you'll find:</p>
            <ul>
              <li>Your complete assessment breakdown</li>
              <li>Module recommendations based on your goals</li>
              <li>Resources to get started immediately</li>
            </ul>
            
            <p>Most people who take action within 24 hours see results 3x faster. Don't wait.</p>
            
            <p>To your success,<br>
            Marcus</p>
          </div>
        </body>
      </html>
    `,
  })
}

// Purchase confirmation email
export async function sendPurchaseConfirmationEmail(
  email: string,
  fullName: string,
  moduleName: string,
  amountPaid: number,
  accessUrl: string
) {
  const moduleDisplayNames: Record<string, string> = {
    strengths: 'Strengths Coaching Module',
    resume: 'Resume Module + Professional Redo',
    innervue: 'Inner Vue Interview Tool',
    bundle: 'Complete Career Journey Bundle',
    annual: 'Annual Renewal',
  }

  return sendEmail({
    to: email,
    subject: `Your ${moduleDisplayNames[moduleName]} is Ready! 🎉`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1>Welcome to ${moduleDisplayNames[moduleName]}!</h1>
            
            <p>Hi ${fullName},</p>
            
            <p>Your payment of $${(amountPaid / 100).toFixed(2)} has been confirmed and your module is now unlocked.</p>
            
            <a href="${accessUrl}" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              Access Your Module Now →
            </a>
            
            <p><strong>What's Next:</strong></p>
            <ul>
              <li>Complete the module at your own pace</li>
              <li>Download all templates and resources</li>
              <li>Track your progress in your dashboard</li>
            </ul>
            
            <p>Remember: Knowledge without action is just information. Set aside time this week to work through the material.</p>
            
            <p>I'm here if you need anything,<br>
            Marcus</p>
            
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666;">
              <p>Receipt: Order #${Date.now().toString(36).toUpperCase()}</p>
              <p>Questions? Reply to this email or visit your dashboard.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  })
}

// Resume analysis complete email
export async function sendResumeAnalysisEmail(
  email: string,
  fullName: string,
  atsScore: number,
  dashboardUrl: string
) {
  return sendEmail({
    to: email,
    subject: `Your Resume Analysis is Complete (ATS Score: ${atsScore}/100)`,
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="container" style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
            <h1>Your Resume Analysis Results</h1>
            
            <p>Hi ${fullName},</p>
            
            <p>I've finished analyzing your resume. Here's the quick snapshot:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="margin: 0; font-size: 24px;">ATS Score: ${atsScore}/100</h2>
              <p style="margin: 10px 0 0 0; color: #666;">
                ${atsScore >= 80 ? 'Excellent! Your resume is ATS-friendly.' : 
                  atsScore >= 60 ? 'Good foundation, but there\'s room for improvement.' :
                  'Needs work to pass applicant tracking systems.'}
              </p>
            </div>
            
            <p><strong>Your detailed analysis includes:</strong></p>
            <ul>
              <li>Top 3 strengths in your current resume</li>
              <li>Key improvement areas with specific fixes</li>
              <li>Missing keywords for your target roles</li>
              <li>Rewritten sections (professional summary, bullets)</li>
            </ul>
            
            <a href="${dashboardUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0;">
              View Full Analysis →
            </a>
            
            <p>Pro tip: Implement at least 3 recommendations today and you'll see more interview requests within a week.</p>
            
            <p>Let's get you hired,<br>
            Marcus</p>
          </div>
        </body>
      </html>
    `,
  })
}

// Helper: Strip HTML tags for plain text version
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
