const request = require("supertest");
const app = require("../app");  
const db = require("../db");
const slugify = require('slugify');

beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
  await db.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 100, false, null)");
});

afterAll(async () => {
  await db.close();
});

describe("Company Routes", () => {
  describe("GET /companies", () => {
    test("Should respond with an array of companies", async () => {
      const response = await request(app).get("/companies");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("companies");
      expect(Array.isArray(response.body.companies)).toBe(true);
    });
  });

  describe("GET /companies/:code", () => {
    test("Should return a company object for a valid code", async () => {
      const response = await request(app).get("/companies/apple");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("company");
      expect(response.body.company).toHaveProperty("code", "apple");
    });

    test("It should return a 404 for an invalid company code", async () => {
      const response = await request(app).get("/companies/nonexistent");
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /companies", () => {
    test("Should create a new company", async () => {
      const newCompany = {  name: "Microsoft", description: "Tech products" };
      const response = await request(app).post("/companies").send(newCompany);
      const expectedCode = slugify("Microsoft", { lower: true, strict: true });
      expect(response.statusCode).toBe(201);
      expect(response.body.company).toHaveProperty("description", "Tech products");
      expect(response.body.company).toHaveProperty("name", "Microsoft");
      expect(response.body.company).toHaveProperty("code", expectedCode); 
    });
  });

  describe("PUT /companies/:code", () => {
    test("Should update an existing company", async () => {
      const updates = { name: "Updated Name", description: "Updated Description" };
      const response = await request(app).put("/companies/apple").send(updates);
      expect(response.statusCode).toBe(200);
      expect(response.body.company).toHaveProperty("name", "Updated Name");
    });
  });

  describe("DELETE /companies/:code", () => {
    test("Should delete a company", async () => {
        const companyName = "Hewlett-Packard";
        const companyCode = slugify(companyName, { lower: true, strict: true });
        await request(app).post("/companies").send({ name: companyName, description: "Tech products" });

        const response = await request(app).delete(`/companies/${companyCode}`);
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: "deleted" });
    });
});

});
