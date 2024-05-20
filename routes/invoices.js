const express = require("express");
const router = express.Router();
const db = require("../db");
const ExpressError = require("../expressError");

router.get('/', async (req, res, next) => {
    //returns a list of all invoices
    try {
        const results = await db.query("SELECT id, comp_code FROM invoices");
        res.json({ invoices: results.rows });
    } catch (err) {
        next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    //gets details about specific invoice by its id
    try {
        const { id } = req.params;
        const invoiceResult = await db.query("SELECT i.id, i.comp_code, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description FROM invoices i JOIN companies c ON i.comp_code = c.code WHERE i.id = $1", [id]);

        if (invoiceResult.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }
        const invoice = invoiceResult.rows[0];
        res.json({ invoice });
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    //creats new invoice
    try {
        const { comp_code, amt } = req.body;
        const result = await db.query("INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date", [comp_code, amt]);
        res.status(201).json({ invoice: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

// router.put("/:id", async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const { amt, paid } = req.body;

//         const result = await db.query("UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date", [amt, id]);
//         if (result.rows.length === 0) {
//             throw new ExpressError("Invoice not found", 404);
//         }
//         res.json({ invoice: result.rows[0] });
//     } catch (err) {
//         next(err);
//     }
// });

router.put("/:id", async (req, res, next) => {
    //updates existing invoice
    try {
        const { id } = req.params;
        const { amt, paid } = req.body;

        // retrieve the current invoice to check its existence and paid status
        const invoiceQuery = await db.query("SELECT paid, paid_date FROM invoices WHERE id = $1", [id]);
        if (invoiceQuery.rows.length === 0) {
            throw new ExpressError("Invoice not found", 404);
        }

        const invoice = invoiceQuery.rows[0];

        // determine the new paid_date based on the provided 'paid' status
        let newPaidDate = invoice.paid_date; // default to current paid_date
        if (paid && !invoice.paid) {
            newPaidDate = new Date(); // set to today if paying an unpaid invoice
        } else if (!paid && invoice.paid) {
            newPaidDate = null; // Clear the paid_date if un-paying the invoice
        }

        // Update the invoice
        const result = await db.query(
            "UPDATE invoices SET amt = $1, paid = $2, paid_date = $3 WHERE id = $4 RETURNING id, comp_code, amt, paid, add_date, paid_date",
            [amt, paid, newPaidDate, id]
        );

        res.json({ invoice: result.rows[0] });
    } catch (err) {
        next(err);
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
        res.json({ status: "deleted" });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
