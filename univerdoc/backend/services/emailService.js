const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST || 'smtp.sendgrid.net';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (process.env.NODE_ENV === 'production' && user && pass && pass !== 'mock_smtp_pass') {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    // Development / demo logger transporter
    transporter = {
      sendMail: async (options) => {
        console.log('\n================== EMAIL DISPATCHED (DEV/DEMO MODE) ==================');
        console.log(`To: ${options.to}`);
        console.log(`From: ${options.from}`);
        console.log(`Subject: ${options.subject}`);
        console.log('--- Body Preview ---');
        console.log(options.text || options.html.replace(/<[^>]*>?/gm, ' ').substring(0, 300) + '...');
        console.log('======================================================================\n');
        return { messageId: 'mock-' + Date.now() };
      },
    };
  }

  return transporter;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@univerdoc.edu.ng';

function emailWrapper(title, content) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #6366f1;">
        <h2 style="color: #1e1b4b; margin: 0; font-size: 24px; letter-spacing: -0.5px;">UniverDoc · PTI Effurun</h2>
        <p style="color: #64748b; font-size: 13px; margin: 4px 0 0 0;">Petroleum Training Institute — Admission Clearance Portal</p>
      </div>
      <div style="padding: 24px 0;">
        <h3 style="color: #0f172a; margin-top: 0;">${title}</h3>
        ${content}
      </div>
      <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 12px;">
        <p style="margin: 0;">This is an automated notification from the Petroleum Training Institute (PTI) Document Verification System.</p>
        <p style="margin: 4px 0 0 0;">Accredited under National Board for Technical Education (NBTE), Nigeria.</p>
      </div>
    </div>
  `;
}

async function sendDocumentApprovedEmail({ to, studentName, matricNo, documentName, departmentName }) {
  const timestamp = new Date().toLocaleString();
  const subject = `UniverDoc: ${documentName} Approved ✓`;
  const html = emailWrapper(
    'Clearance Document Approved',
    `
      <p>Dear <strong>${studentName}</strong> (Matric No: <code style="background: #eef2ff; color: #4338ca; padding: 2px 6px; border-radius: 4px;">${matricNo}</code>),</p>
      <div style="background-color: #f0fdf4; border-left: 4px solid #16a34a; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
        <p style="color: #166534; margin: 0; font-weight: 600;">Document Verified & Approved</p>
        <p style="color: #14532d; margin: 6px 0 0 0; font-size: 14px;">Your submission for <strong>${documentName}</strong> has been officially verified and approved by the <strong>${departmentName}</strong> department.</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 16px;">
        <tr><td style="color: #64748b; padding: 6px 0;">Student:</td><td style="font-weight: 600;">${studentName}</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Matric No:</td><td style="font-weight: 600;">${matricNo}</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Document:</td><td style="font-weight: 600;">${documentName}</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Department:</td><td style="font-weight: 600;">${departmentName}</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Timestamp:</td><td style="font-weight: 600;">${timestamp}</td></tr>
      </table>
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

async function sendDocumentRejectedEmail({ to, studentName, matricNo, documentName, rejectionReason, departmentName }) {
  const subject = `UniverDoc: Action Required — ${documentName} Rejected`;
  const html = emailWrapper(
    'Action Required: Document Rejected',
    `
      <p>Dear <strong>${studentName}</strong> (Matric No: <code style="background: #fee2e2; color: #991b1b; padding: 2px 6px; border-radius: 4px;">${matricNo}</code>),</p>
      <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
        <p style="color: #991b1b; margin: 0; font-weight: 600;">Document Rejected by ${departmentName}</p>
        <p style="color: #7f1d1d; margin: 6px 0 0 0; font-size: 14px;"><strong>Reason for Rejection:</strong></p>
        <p style="background: #ffffff; padding: 10px; border-radius: 4px; border: 1px solid #fecaca; color: #b91c1c; font-size: 13px; margin: 6px 0;">${rejectionReason}</p>
      </div>
      <p style="font-size: 14px; color: #334155;"><strong>Resubmission Instructions:</strong></p>
      <ol style="font-size: 14px; color: #475569; padding-left: 20px;">
        <li>Log into your UniverDoc Student Portal.</li>
        <li>Locate <strong>${documentName}</strong> under your document checklist.</li>
        <li>Click <strong>Resubmit Document</strong> to upload a corrected copy that resolves the issues noted above.</li>
      </ol>
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

async function sendRegistrationWelcomeEmail({ to, studentName, matricNo, username }) {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = `Welcome to UniverDoc, ${studentName}`;
  const html = emailWrapper(
    'Welcome to PTI Admission Clearance',
    `
      <p>Dear <strong>${studentName}</strong>,</p>
      <p>Your registration for the Petroleum Training Institute (PTI) Online Document Verification & Clearance platform is complete.</p>
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 18px 0;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Matriculation Number:</strong> <code style="color: #4f46e5;">${matricNo}</code></p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Portal Username:</strong> <code style="color: #4f46e5;">${username}</code></p>
        <p style="margin: 0; font-size: 14px;"><strong>Access Portal:</strong> <a href="${loginUrl}" style="color: #4f46e5; font-weight: 600;">${loginUrl}</a></p>
      </div>
      <p style="font-size: 14px; color: #475569;">Please log in promptly to submit your clearance documents across all 4 departments: Finance, Library, Administration, and Academic Records.</p>
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

async function sendCredentialIssuedEmail({ to, deptName, slotNumber, username, plainPassword }) {
  const loginUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const subject = `UniverDoc: Department Access Credentials`;
  const html = emailWrapper(
    'Department Staff Access Credentials Issued',
    `
      <p>Official staff credentials have been generated for the <strong>${deptName}</strong> clearance desk.</p>
      <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; padding: 16px; border-radius: 8px; margin: 18px 0;">
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Department: <strong>${deptName}</strong> (Slot ${slotNumber})</p>
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Username: <code style="font-size: 15px; font-weight: bold; color: #0f172a;">${username}</code></p>
        <p style="margin: 0 0 6px 0; font-size: 13px; color: #64748b;">Password: <code style="font-size: 15px; font-weight: bold; color: #b91c1c;">${plainPassword}</code> (shown once)</p>
        <p style="margin: 10px 0 0 0; font-size: 13px;">Login URL: <a href="${loginUrl}" style="color: #4f46e5;">${loginUrl}</a></p>
      </div>
      <p style="font-size: 13px; color: #b45309; background: #fef3c7; padding: 10px; border-radius: 6px;">
        <strong>Notice:</strong> Single concurrent session policy is strictly enforced. Keep these credentials confidential.
      </p>
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

async function sendWeeklyPendingSummaryEmail({ to, deptName, count, documents = [], oldestSubmissionDate }) {
  const subject = `UniverDoc: Weekly Pending Review Summary — ${deptName}`;
  const docRows = documents
    .slice(0, 10)
    .map(
      (d) => `
      <li style="margin-bottom: 6px;">
        <strong>${d.document_type ? d.document_type.label : 'Document'}</strong> — 
        ${d.student ? d.student.name : 'Student'} (${d.student ? d.student.matric_no : ''}), 
        submitted on ${d.uploaded_at ? new Date(d.uploaded_at).toLocaleDateString() : 'N/A'}
      </li>`
    )
    .join('');

  const html = emailWrapper(
    `Weekly Pending Review Summary — ${deptName}`,
    `
      <p>This is your automated weekly queue summary for the <strong>${deptName}</strong> department.</p>
      <div style="background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <h4 style="margin: 0 0 8px 0; color: #b45309; font-size: 16px;">Documents Awaiting Clearance: <strong>${count}</strong></h4>
        <p style="margin: 0; color: #92400e; font-size: 14px;">Oldest Pending Submission: <strong>${oldestSubmissionDate ? new Date(oldestSubmissionDate).toLocaleString() : 'None'}</strong></p>
      </div>
      ${
        count > 0
          ? `<ul style="font-size: 14px; color: #334155; padding-left: 20px;">${docRows}</ul>`
          : '<p style="color: #16a34a; font-weight: 500;">Your clearance queue is currently completely clear! Great job.</p>'
      }
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
}

async function sendIssueFlaggedEmail({ to, reporterName, reporterRole, departmentName, subject: issueSubject, body }) {
  const timestamp = new Date().toLocaleString();
  const subject = `UniverDoc: New Issue Reported by [${reporterRole.toUpperCase()}] — ${issueSubject}`;
  const html = emailWrapper(
    'New System Issue Flagged',
    `
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 14px 18px; margin: 16px 0; border-radius: 6px;">
        <h4 style="margin: 0 0 6px 0; color: #991b1b;">${issueSubject}</h4>
        <p style="margin: 0; color: #7f1d1d; font-size: 14px;">${body}</p>
      </div>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-top: 14px;">
        <tr><td style="color: #64748b; padding: 6px 0;">Reported By:</td><td style="font-weight: 600;">${reporterName} (${reporterRole})</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Department:</td><td style="font-weight: 600;">${departmentName || 'General'}</td></tr>
        <tr><td style="color: #64748b; padding: 6px 0;">Timestamp:</td><td style="font-weight: 600;">${timestamp}</td></tr>
      </table>
    `
  );

  return getTransporter().sendMail({
    from: FROM_EMAIL,
    to: to || 'superadmin@univerdoc.edu.ng',
    subject,
    html,
  });
}

module.exports = {
  sendDocumentApprovedEmail,
  sendDocumentRejectedEmail,
  sendRegistrationWelcomeEmail,
  sendCredentialIssuedEmail,
  sendWeeklyPendingSummaryEmail,
  sendIssueFlaggedEmail,
};