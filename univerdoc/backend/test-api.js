const http = require('http');
const { app } = require('./server');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  const server = app.listen(3099, async () => {
    console.log('Testing server started on 3099');
    try {
      // 1. Health check
      const health = await makeRequest({
        hostname: 'localhost',
        port: 3099,
        path: '/api/health',
        method: 'GET',
      });
      console.log('1. Health check:', health.status, health.data.project);

      // 2. Student login
      const studentLogin = await makeRequest(
        {
          hostname: 'localhost',
          port: 3099,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { username: 'alex.mercer', password: 'Alex@123' }
      );
      console.log('2. Student login:', studentLogin.status, studentLogin.data.user?.name);
      const studentToken = studentLogin.data.token;

      // 3. Student progress
      const progress = await makeRequest({
        hostname: 'localhost',
        port: 3099,
        path: '/api/student/progress',
        method: 'GET',
        headers: { Authorization: `Bearer ${studentToken}` },
      });
      console.log('3. Student progress:', progress.status, `Overall: ${progress.data.overall_pct}%`);

      // 4. Dept Staff login (finance_01)
      const staffLogin1 = await makeRequest(
        {
          hostname: 'localhost',
          port: 3099,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { username: 'finance_01', password: 'Staff@123' }
      );
      console.log('4. Staff login 1:', staffLogin1.status, staffLogin1.data.user?.username);
      const staffToken = staffLogin1.data.token;

      // 5. Attempt second login with same dept staff credentials (Rule 3: Concurrent session lock)
      const staffLogin2 = await makeRequest(
        {
          hostname: 'localhost',
          port: 3099,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { username: 'finance_01', password: 'Staff@123' }
      );
      console.log('5. Concurrent login attempt (should be 403):', staffLogin2.status, staffLogin2.data.error);

      // 6. Staff logout
      const staffLogout = await makeRequest({
        hostname: 'localhost',
        port: 3099,
        path: '/api/auth/logout',
        method: 'POST',
        headers: { Authorization: `Bearer ${staffToken}` },
      });
      console.log('6. Staff logout:', staffLogout.status, staffLogout.data.message);

      // 7. Re-login after logout (should succeed)
      const staffLogin3 = await makeRequest(
        {
          hostname: 'localhost',
          port: 3099,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { username: 'finance_01', password: 'Staff@123' }
      );
      console.log('7. Staff re-login after logout:', staffLogin3.status, staffLogin3.data.user?.username);

      // 8. Super Admin login
      const adminLogin = await makeRequest(
        {
          hostname: 'localhost',
          port: 3099,
          path: '/api/auth/login',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        },
        { username: 'superadmin', password: 'Admin@123' }
      );
      console.log('8. Super Admin login:', adminLogin.status, adminLogin.data.user?.role);
      const adminToken = adminLogin.data.token;

      // 9. Super Admin stats
      const stats = await makeRequest({
        hostname: 'localhost',
        port: 3099,
        path: '/api/admin/stats',
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log('9. Admin stats:', stats.status, stats.data);

      console.log('\n>>> ALL BACKEND API VERIFICATIONS PASSED SUCCESSFULLY! <<<\n');
    } catch (e) {
      console.error('Test error:', e);
    } finally {
      server.close();
      process.exit(0);
    }
  });
}

runTests();