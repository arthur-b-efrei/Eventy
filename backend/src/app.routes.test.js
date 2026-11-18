import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "./app.js";

describe("routes API", () => {
  it("GET /api/health répond ok", async () => {
    const res = await request(app).get("/api/health");
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: "ok" });
  });

  it("les routes protégées refusent sans token", async () => {
    const cas = [
      ["get", "/api/reservations"],
      ["post", "/api/events"],
      ["post", "/api/events/abc123/inscription"],
      ["get", "/api/events/abc123/inscrits"],
      ["patch", "/api/events/abc123"],
      ["delete", "/api/events/abc123"],
      ["get", "/api/events/abc123/messages"],
      ["get", "/api/auth/me"],
      ["patch", "/api/users/me"],
    ];

    for (const [methode, chemin] of cas) {
      const res = await request(app)[methode](chemin);
      assert.equal(
        res.status,
        401,
        `${methode.toUpperCase()} ${chemin} devrait être 401, reçu ${res.status}`,
      );
    }
  });

});
