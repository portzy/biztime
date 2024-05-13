const express = require("express");
const router = express.Router();
const db = require("../db");

router.get('/', async (rec, res, next) => {
    //returns a list of all invoices
    try {
        const results = await db.query("SELECT id, comp_code FROM invoices");
        return res.json({ invoices: results.rows });
    } catch (err) {
        return next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    //gets details about specific invoice by its id
    try {
        const { id } = req.params;
        const invoiceResult = await db.query(
            `SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description 
             FROM invoices i
             JOIN companies c ON i.comp_code = c.code
             WHERE i.id = $1`, [id]);

        if (invoiceResult.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        const invoice = invoiceResult.rows[0];
        invoice.company = {
            code: invoice.code,
            name: invoice.name,
            description: invoice.description
        };
        delete invoice.code;
        delete invoice.name;
        delete invoice.description;

        return res.json({ invoice });
    } catch (err) {
        return next(err);
    }
});

router.post("/", async (req, res, next) => {
    //creats new invoice
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query(
            "INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [comp_code, amt]);

        return res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.put("/:id", async (req, res, next) => {
    //updates existing invoice
    try {
        const { id } = req.params;
        const { amt } = req.body;
        const result = await db.query(
            "UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [amt, id]);

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        return res.json({ invoice: result.rows[0] });
    } catch (err) {
        return next(err);
    }
});

router.delete("/:id", async (req, res, next) => {
    //deletes an invoice
    try {
        const { id } = req.params;
        const result = await db.query("DELETE FROM invoices WHERE id = $1 RETURNING id", [id]);

        if (result.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        return res.json({ status: "deleted" });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;



