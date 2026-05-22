import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";

const app = createApp();

describe("api validation", () => {
  it("returns validation errors for bad salary ingestion", async () => {
    const response = await request(app).post("/api/ingest-salary").send({
      company: "",
      role: "Software Engineer",
      level_standardized: "L4",
      location: "Bengaluru",
      experience_years: 4,
      base_salary: -1,
      confidence_score: 90
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("rejects invalid compare inputs before service execution", async () => {
    const response = await request(app).get("/api/compare?id1=a&id2=a");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("handles malformed json", async () => {
    const response = await request(app)
      .post("/api/ingest-salary")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Malformed JSON");
  });
});
