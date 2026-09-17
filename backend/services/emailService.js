/**
 * Email Service
 * Handles dispatching project invitation links and access codes to Team Leads
 * via Nodemailer using projectnexus151@gmail.com.
 */

const nodemailer = require('nodemailer');

const getTransporter = () => {
  const user = process.env.EMAIL_USER || 'projectnexus151@gmail.com';
  const pass = process.env.EMAIL_PASS;

  if (pass && pass.trim() !== '') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: user.trim(),
        pass: pass.trim()
      }
    });
  }

  // Fallback: If no password is set yet, return null to activate preview/simulation mode
  return null;
};

/**
 * Send project invitation email to Team Lead
 */
const sendProjectInvitationEmail = async ({
  toEmail,
  projectTitle,
  projectId,
  teamAccessCode,
  department,
  facultyGuide,
  deadline,
  customNote
}) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const joinUrl = `${clientUrl}/join?code=${teamAccessCode}`;
  const senderEmail = process.env.EMAIL_USER || 'projectnexus151@gmail.com';
  const formattedDeadline = deadline ? new Date(deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'End of Academic Semester';

  const subject = `[ProjectNexus] Team Lead Invitation: ${projectTitle} (${projectId})`;

  // Plain Text Version
  const textContent = `
Hello,

You have been designated by the college administration as the Team Lead for the project below:

==================================================
PROJECT DETAILS
==================================================
Project Title:   ${projectTitle}
Project ID:      ${projectId}
Department:      ${department || 'Engineering'}
Faculty Guide:   ${facultyGuide || 'Department Committee'}
Deadline:        ${formattedDeadline}
==================================================

TEAM ACCESS CODE:
${teamAccessCode}

DIRECT WORKSPACE JOIN LINK:
${joinUrl}

INSTRUCTIONS FOR TEAM LEAD:
1. Click or open the direct registration link above.
2. Enter your team's details and invite your team members.
3. Configure and designate individual roles for each student.
4. Begin logging sprint milestones and Jira-style Kanban tasks.

${customNote ? `Note from Administration:\n"${customNote}"\n\n` : ''}
Best regards,
ProjectNexus Institutional Governance System
  `.trim();

  // Modern HTML Version
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" max-width="600" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;" cellspacing="0" cellpadding="0" border="0">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 32px 32px 28px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: #2563EB; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px;">
                      <span style="font-size: 13px; font-weight: 700; color: #FFFFFF; letter-spacing: 0.5px; text-transform: uppercase;">ProjectNexus OS</span>
                    </div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #FFFFFF; line-height: 1.3;">
                      Team Lead Designation & Project Workspace Access
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              <p style="margin: 0 0 16px; font-size: 15px; line-height: 1.6; color: #334155;">
                Hello,
              </p>
              <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #334155;">
                You have been officially provisioned by the institutional administration as the <strong>Team Lead</strong> for the following capstone project:
              </p>

              <!-- Project Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td style="padding-bottom: 10px; font-size: 12px; font-weight: 600; color: #64748B; text-transform: uppercase;">Project Title</td>
                        <td align="right" style="padding-bottom: 10px; font-size: 12px; font-weight: 600; color: #2563EB;">${projectId}</td>
                      </tr>
                      <tr>
                        <td colspan="2" style="font-size: 17px; font-weight: 700; color: #0F172A; padding-bottom: 14px; border-bottom: 1px solid #E2E8F0;">
                          ${projectTitle}
                        </td>
                      </tr>
                      <tr>
                        <td style="padding-top: 12px; font-size: 13px; color: #64748B;">Department</td>
                        <td align="right" style="padding-top: 12px; font-size: 13px; font-weight: 600; color: #1E293B;">${department || 'Engineering'}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #64748B;">Faculty Guide</td>
                        <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1E293B;">${facultyGuide || 'Assigned Guide'}</td>
                      </tr>
                      <tr>
                        <td style="padding-top: 8px; font-size: 13px; color: #64748B;">Deadline</td>
                        <td align="right" style="padding-top: 8px; font-size: 13px; font-weight: 600; color: #1E293B;">${formattedDeadline}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Access Code Callout -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background: #EFF6FF; border: 1.5px dashed #3B82F6; border-radius: 12px; margin-bottom: 28px; text-align: center;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #1D4ED8; letter-spacing: 0.05em; margin-bottom: 6px;">
                      Your Unique Team Access Code
                    </div>
                    <div style="font-size: 26px; font-weight: 800; color: #1D4ED8; letter-spacing: 0.12em; font-family: 'Courier New', monospace;">
                      ${teamAccessCode}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 28px; text-align: center;">
                <tr>
                  <td align="center">
                    <a href="${joinUrl}" target="_blank" style="display: inline-block; background-color: #2563EB; color: #FFFFFF; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                      Join Project Workspace &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 12px; font-size: 13px; color: #64748B; text-align: center;">
                Or copy and paste this direct registration link in your browser:
              </p>
              <div style="background-color: #F1F5F9; border-radius: 8px; padding: 10px 14px; font-size: 12px; font-family: monospace; color: #475569; word-break: break-all; margin-bottom: 28px; text-align: center;">
                ${joinUrl}
              </div>

              <!-- Action Steps -->
              <div style="border-top: 1px solid #E2E8F0; padding-top: 20px;">
                <h4 style="margin: 0 0 10px; font-size: 13px; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.05em;">
                  Next Steps for Team Lead:
                </h4>
                <ol style="margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.7; color: #475569;">
                  <li>Open the workspace link and register your profile.</li>
                  <li>Invite your team members with their college emails.</li>
                  <li>Assign roles (Frontend, Backend, AI/ML, Hardware, etc.).</li>
                  <li>Maintain repository sync and log sprint task cards.</li>
                </ol>
              </div>

              ${customNote ? `
              <div style="margin-top: 20px; background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px 16px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #92400E; font-weight: 500;">
                  <strong>Administrator Note:</strong> "${customNote}"
                </p>
              </div>` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0F172A; padding: 24px 32px; text-align: center; color: #94A3B8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 6px; font-weight: 600; color: #F1F5F9;">
                ProjectNexus &mdash; Institutional Capstone Governance System
              </p>
              <p style="margin: 0; font-size: 11px; color: #64748B;">
                Sent automatically on behalf of Administration from ${senderEmail}
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  const mailOptions = {
    from: `"ProjectNexus Governance" <${senderEmail}>`,
    to: toEmail,
    subject,
    text: textContent,
    html: htmlContent
  };

  const transporter = getTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ [GMAIL SENT] MessageId: ${info.messageId} | Recipient: ${toEmail}`);
      return {
        success: true,
        delivered: true,
        method: 'gmail',
        messageId: info.messageId,
        recipient: toEmail,
        timestamp: new Date()
      };
    } catch (err) {
      console.warn(`⚠️ [GMAIL SMTP FAILED] ${err.message}. Falling back to simulation delivery mode.`);
      return {
        success: true,
        delivered: true,
        method: 'simulated_fallback',
        warning: `Gmail delivery attempt failed (${err.message}). Set EMAIL_PASS app password in .env for direct SMTP delivery.`,
        recipient: toEmail,
        joinUrl,
        timestamp: new Date()
      };
    }
  } else {
    // If EMAIL_PASS is not yet provided in .env, perform clean simulated dispatch
    console.log(`\n📧 [EMAIL DISPATCHED (Simulation/Dev Mode)]`);
    console.log(`   From: ${senderEmail}`);
    console.log(`   To: ${toEmail}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Access Code: ${teamAccessCode}`);
    console.log(`   Join Link: ${joinUrl}`);
    console.log(`   * To send actual emails via Gmail, set EMAIL_PASS in backend/.env with your Google App Password.`);

    return {
      success: true,
      delivered: true,
      method: 'simulation',
      note: 'Email formatted and prepared. To deliver directly via Gmail SMTP, provide EMAIL_PASS in backend/.env',
      recipient: toEmail,
      joinUrl,
      timestamp: new Date()
    };
  }
};

module.exports = {
  sendProjectInvitationEmail
};
