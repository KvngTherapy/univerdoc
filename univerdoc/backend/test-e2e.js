const http = require('http');
const fs = require('fs');
const path = require('path');
const { app } = require('./server');

function request(options, data = null, isMultipart = false) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);

    if (data) {
      if (isMultipart) {
        req.write(data);
      } else {
        req.write(typeof data === 'string' ? data : JSON.stringify(data));
      }
    }
    req.end();
  });
}

function buildMultipart(fields, fileField, filename, fileBuffer, mimeType) {
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  let body = '';

  for (const [key, val] of Object.entries(fields)) {
    body += `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
    body += `${val}\r\n`;
  }

  body += `--${boundary}\r\n`;
  body += `Content-Disposition: form-data; name="${fileField}"; filename="${filename}"\r\n`;
  body += `Content-Type: ${mimeType}\r\n\r\n`;

  const preBuffer = Buffer.from(body, 'utf-8');
  const postBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf-8');
  const fullBuffer = Buffer.concat([preBuffer, fileBuffer, postBuffer]);

  return {
    buffer: fullBuffer,
    contentType: `multipart/form-data; boundary=${boundary}`,
  };
}

async function runE2ETests() {
  const server = app.listen(3098, async () => {
    console.log('>>> STARTING COMPREHENSIVE E2E VERIFICATION SUITE (Port 3098) <<<\n');
    let passed = 0;
    let failed = 0;

    const assert = (condition, desc) => {
      if (condition) {
        console.log(`[PASS] ${desc}`);
        passed++;
      } else {
        console.error(`[FAIL] ${desc}`);
        failed++;
      }
    };

    try {
      // 1. Health check
      const health = await request({ hostname: 'localhost', port: 3098, path: '/api/health', method: 'GET' });
      assert(health.status === 200 && health.data.project === 'UniverDoc', 'Health check returns 200 with UniverDoc identity');

      // 2. Super Admin Login
      const adminLogin = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { username: 'superadmin', password: 'Admin@123' }
      );
      assert(adminLogin.status === 200 && adminLogin.data.user.role === 'superadmin', 'Superadmin login succeeds');
      const adminToken = adminLogin.data.token;

      // 3. Admin Overview Stats
      const stats = await request(
        { hostname: 'localhost', port: 3098, path: '/api/admin/stats', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(stats.status === 200 && stats.data.total_depts === 4, 'Stats return 4 departments');

      // 4. Admin Departments List
      const depts = await request(
        { hostname: 'localhost', port: 3098, path: '/api/admin/departments', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(depts.status === 200 && depts.data.length === 4, 'Admin departments list contains 4 departments');
      const financeDept = depts.data.find((d) => d.slug === 'finance');
      assert(financeDept && financeDept.staff.length === 2, 'Finance department has exactly 2 credential slots');

      // 5. Reset Credentials for slot 2
      const resetRes = await request(
        { hostname: 'localhost', port: 3098, path: '/api/admin/credentials/reset', method: 'POST', headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } },
        { dept_id: financeDept.id, slot_number: 2 }
      );
      assert(resetRes.status === 200 && resetRes.data.password && resetRes.data.password.length === 12, 'Credentials reset generates 12-char password and returns once');

      // 6. Student Registration Validation
      // 6a. Invalid matric number format rejection
      const badMatricReg = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { name: 'Test Student', email: 'test.student@pti.edu.ng', matric_no: 'INVALID_MATRIC_123', username: 'test.student', password: 'Password@123' }
      );
      assert(badMatricReg.status === 400, 'Student registration rejects invalid matric format (regex enforcement)');

      // 6b. Valid matric registration
      const testMatric = `M.24/ND/PEG/88888`;
      const goodMatricReg = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/register', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { name: 'Chukwudi Okafor', email: 'chukwudi.okafor@pti.edu.ng', matric_no: testMatric, username: 'chukwudi.okafor', password: 'Password@123' }
      );
      assert(goodMatricReg.status === 201, 'Student registration succeeds with valid PTI matric format');

      // 7. New Student Login
      const studentLogin = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { username: 'chukwudi.okafor', password: 'Password@123' }
      );
      assert(studentLogin.status === 200 && studentLogin.data.user.role === 'student', 'Newly registered student logs in successfully');
      const studentToken = studentLogin.data.token;

      // 8. Student Document Checklist
      const studentDocs = await request(
        { hostname: 'localhost', port: 3098, path: '/api/student/documents', method: 'GET', headers: { Authorization: `Bearer ${studentToken}` } }
      );
      assert(studentDocs.status === 200 && studentDocs.data.length === 4, 'Student receives checklist organized across all 4 departments');
      const financeGroup = studentDocs.data.find((g) => g.slug === 'finance');
      const feeDoc = financeGroup.documents.find((d) => d.slug === 'fee_payment_receipt');
      assert(feeDoc && feeDoc.status === 'not_submitted', 'Document type is initially not_submitted');

      // 9. Student Uploads Document
      const mockPdfBuffer = Buffer.from('%PDF-1.4 mock content for upload test', 'utf-8');
      const multipart = buildMultipart(
        { document_type_id: feeDoc.document_type_id },
        'file',
        'chukwudi_fee_receipt.pdf',
        mockPdfBuffer,
        'application/pdf'
      );
      const uploadRes = await request(
        {
          hostname: 'localhost',
          port: 3098,
          path: '/api/student/documents/upload',
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`,
            'Content-Type': multipart.contentType,
            'Content-Length': multipart.buffer.length,
          },
        },
        multipart.buffer,
        true
      );
      assert(uploadRes.status === 200 && uploadRes.data.submission.status === 'pending', 'Student uploads document; status transitions to pending');
      const submissionId = uploadRes.data.submission.id;

      // 10. Department Staff Login & Queue Inspection
      const staffLogin = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { username: 'finance_01', password: 'Staff@123' }
      );
      assert(staffLogin.status === 200 && staffLogin.data.user.role === 'dept_staff', 'Finance staff slot 1 logs in successfully');
      const staffToken = staffLogin.data.token;

      // 11. Concurrent Session Lock Enforcement (Rule 3)
      const concurrentAttempt = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { username: 'finance_01', password: 'Staff@123' }
      );
      assert(concurrentAttempt.status === 403 && concurrentAttempt.data.error === 'This account is already in use', 'Concurrent session rejected with "This account is already in use"');

      // 12. Staff Views Queue
      const queueRes = await request(
        { hostname: 'localhost', port: 3098, path: '/api/dept/queue', method: 'GET', headers: { Authorization: `Bearer ${staffToken}` } }
      );
      const uploadedItem = queueRes.data.find((item) => item.id === submissionId);
      assert(queueRes.status === 200 && !!uploadedItem, 'Uploaded document appears in Finance staff review queue');

      // 13. Rejection Reason Mandatory Enforcement (Rule 4)
      const blankReject = await request(
        { hostname: 'localhost', port: 3098, path: `/api/dept/reject/${submissionId}`, method: 'POST', headers: { Authorization: `Bearer ${staffToken}`, 'Content-Type': 'application/json' } },
        { rejection_note: '   ' }
      );
      assert(blankReject.status === 400 && blankReject.data.error === 'Rejection reason is mandatory.', 'Rejection without reason is strictly rejected by backend');

      // 14. Document Approval
      const approveRes = await request(
        { hostname: 'localhost', port: 3098, path: `/api/dept/approve/${submissionId}`, method: 'POST', headers: { Authorization: `Bearer ${staffToken}` } }
      );
      assert(approveRes.status === 200 && approveRes.data.submission.status === 'approved', 'Document approved successfully');

      // 15. Student Progress Updated
      const updatedProgress = await request(
        { hostname: 'localhost', port: 3098, path: '/api/student/progress', method: 'GET', headers: { Authorization: `Bearer ${studentToken}` } }
      );
      assert(updatedProgress.status === 200 && updatedProgress.data.approved_count > 0, 'Student clearance progress reflects newly approved document');

      // 16. Audit Log Verification
      const auditRes = await request(
        { hostname: 'localhost', port: 3098, path: '/api/admin/audit-logs?page=1&limit=5', method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } }
      );
      assert(auditRes.status === 200 && auditRes.data.logs.some((l) => l.action === 'document.approved'), 'Document approval action recorded in immutable audit log');

      // 17. Staff Logout Releases Session Lock
      const logoutRes = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/logout', method: 'POST', headers: { Authorization: `Bearer ${staffToken}` } }
      );
      assert(logoutRes.status === 200, 'Staff logs out and session is released in database');

      // 18. Staff Can Re-login after logout
      const reloginRes = await request(
        { hostname: 'localhost', port: 3098, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
        { username: 'finance_01', password: 'Staff@123' }
      );
      assert(reloginRes.status === 200, 'Staff can log back in immediately after session release');

      console.log(`\n=================================================`);
      console.log(`E2E SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
      console.log(`=================================================\n`);
    } catch (err) {
      console.error('Fatal E2E error:', err);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runE2ETests();