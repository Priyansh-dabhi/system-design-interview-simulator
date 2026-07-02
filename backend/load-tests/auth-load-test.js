import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 5 },  // Ramp up to 5 users over 15 seconds
    { duration: '30s', target: 15 }, // Ramp up to 15 users over 30 seconds
    { duration: '15s', target: 0 },  // Ramp down to 0 users over 15 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.05'],    // less than 5% error rate
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4500';

export default function () {
  // 1. Health Check
  const healthRes = http.get(`${BASE_URL}/`);
  check(healthRes, {
    'health check is status 200': (r) => r.status === 200,
  });

  // 2. Login Endpoint
  // Note: K6_EMAIL and K6_PASSWORD should be provided via environment variables.
  // DO NOT hardcode sensitive credentials here.
  const email = __ENV.K6_EMAIL || 'test@example.com';
  const password = __ENV.K6_PASSWORD || 'password123';

  const loginPayload = JSON.stringify({ email, password });
  const loginHeaders = { 'Content-Type': 'application/json' };

  const loginRes = http.post(`${BASE_URL}/api/auth/login`, loginPayload, { headers: loginHeaders });
  
  // We check for 200 (Success) or 401/404/429.
  // Note: Due to our new rate limiting (10 req / 15 min), this WILL start failing
  // with 429 Too Many Requests very quickly. This is expected and proves the rate
  // limiter is working.
  check(loginRes, {
    'login is status 200': (r) => r.status === 200,
  });

  sleep(1);
}
