import request from "supertest";

export async function registerAndLogin(app: any, prefix: string) {
  const email = `${prefix}.test@gmail.com`;
  const password = "TestPassword@123";
  const fullName = `${prefix} Test User`;

  const res = await request(app).post("/api/auth/register").send({
    full_name: fullName,
    email,
    password,
  });

  // If already registered in a previous test run (since we don't drop DB between suites, only before all),
  // we might get a 409 Conflict. If so, just login.
  if (res.status === 409) {
    const loginRes = await request(app).post("/api/auth/login").send({
      email,
      password,
    });
    return {
      accessToken: loginRes.body.accessToken,
      refreshToken: loginRes.body.refreshToken,
      user: loginRes.body.user,
    };
  }

  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    user: res.body.user,
  };
}

export function authHeader(token: string) {
  return `Bearer ${token}`;
}
