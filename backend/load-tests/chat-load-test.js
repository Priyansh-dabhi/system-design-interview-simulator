import http from 'k6/http';
import { check, sleep } from 'k6';

// Gemini Free Tier Constraints:
// - 15 RPM (Requests Per Minute)
// - 1 million TPM (Tokens Per Minute)
// - 1500 RPD (Requests Per Day)
// We use a maximum of 3 concurrent virtual users and brief 20s test 
// to strictly avoid hitting these quotas during load testing.

export const options = {
  vus: 3,
  duration: '20s',
  thresholds: {
    http_req_duration: ['p(95)<8000'], // LLM responses can be slow, expecting < 8s
    http_req_failed: ['rate<0.05'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:4500';

export default function () {
  // Ensure token and sessionId are provided via environment variables
  const token = __ENV.TOKEN;
  const sessionId = __ENV.SESSION_ID;

  if (!token || !sessionId) {
    console.error("Please provide TOKEN and SESSION_ID environment variables");
    return;
  }

  const payload = JSON.stringify({
    sessionId: sessionId,
    message: "Can you explain how to load test an express application?"
  });

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const res = http.post(`${BASE_URL}/api/interview/chat`, payload, { headers });

  check(res, {
    'chat response is status 200': (r) => r.status === 200,
  });

  // Important: sleep for 3 seconds between iterations to avoid 
  // immediately hitting Gemini's 15 RPM limit with 3 concurrent users.
  sleep(3);
}
