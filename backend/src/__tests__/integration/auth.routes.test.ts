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
});
