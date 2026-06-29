import request from "supertest";
import app from "../../app.js";

describe("Auth Routes", () => {
  const testUser = {
    full_name: "Priyansh Test",
    email: "priyansh.integration@gmail.com",
    password: "Test@12345",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user and return accessToken + refreshToken", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      // API returns { user, accessToken, refreshToken }
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.password).toBeUndefined(); // password not exposed
    });

    it("should reject duplicate email with 409", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser); // same email again

      // Auth service intentionally returns 409 (Conflict) for duplicate email
      expect(res.status).toBe(409);
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login and return accessToken + refreshToken", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("should reject wrong password with 401", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/refresh", () => {
    it("should refresh and return new tokens", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const refreshToken = loginRes.body.refreshToken;

      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken,
      });

      expect(res.status).toBe(200);
      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
    });

    it("should reject invalid refresh token with 401", async () => {
      const res = await request(app).post("/api/auth/refresh").send({
        refreshToken: "invalid-token",
      });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    it("should return user details with valid token", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user.email).toBe(testUser.email);
    });

    it("should reject without token with 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear session and return 204", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const { accessToken, refreshToken } = loginRes.body;

      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(204);
    });
  });

  describe("POST /api/auth/logout-all", () => {
    it("should revoke all sessions and return 204", async () => {
      const loginRes = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .post("/api/auth/logout-all")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(204);
    });
  });
});
