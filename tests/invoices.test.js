const request = require("supertest");
const app = require("../app");  
const db = require("../db");

let invoiceId;

beforeEach(async () => {
  await db.query("DELETE FROM invoices");
  await db.query("DELETE FROM companies");
  await db.query("INSERT INTO companies (code, name, description) VALUES ('apple', 'Apple Computer', 'Maker of OSX.')");
  const invoiceResult = await db.query("INSERT INTO invoices (comp_code, amt, paid, paid_date) VALUES ('apple', 100, false, null) RETURNING id");
  invoiceId = invoiceResult.rows[0].id; // Save the inserted invoice ID
  console.log("Inserted invoice ID:", invoiceId); // Log inserted invoice ID
});

afterAll(async () => {
  await db.close();
});

describe("Invoice Routes", () => {
  describe("GET /invoices", () => {
    test("Should list all invoices", async () => {
      const response = await request(app).get("/invoices");
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body.invoices)).toBe(true);
    });
  });

  describe("GET /invoices/:id", () => {
    test("Should return an invoice by ID", async () => {
      const response = await request(app).get(`/invoices/${invoiceId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("invoice");
    });

    test("It should return a 404 for a missing invoice", async () => {
      const response = await request(app).get("/invoices/99999");
      expect(response.statusCode).toBe(404);
    });
  });

  describe("POST /invoices", () => {
    test("Should create a new invoice", async () => {
      const newInvoice = { comp_code: "apple", amt: 500 };
      const response = await request(app).post("/invoices").send(newInvoice);
      console.log(response.body);
      expect(response.statusCode).toBe(201);
      expect(response.body.invoice).toHaveProperty("id");
    });
  });

  describe("PUT /invoices/:id", () => {
    test("Should update an invoice", async () => {
      const updates = { amt: 600, paid: true };
      const response = await request(app).put(`/invoices/${invoiceId}`).send(updates);
      console.log(response.body);
      expect(response.statusCode).toBe(200);
      expect(response.body.invoice.amt).toBe(600);
    });
  });

  describe("DELETE /invoices/:id", () => {
    test("Should delete an invoice", async () => {
      const newInvoice = { comp_code: "apple", amt: 300 }
      const createResponse = await request(app).post("/invoices").send(newInvoice);
      const newInvoiceId = createResponse.body.invoice.id;

      const response = await request(app).delete(`/invoices/${newInvoiceId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({ status: "deleted" });
    });
  });
});
