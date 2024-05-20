const express = require('express');
const router = express.Router();
const db = require('../db'); 
const ExpressError = require("../expressError");
const slugify = require('slugify');


router.get('/', async (req, res, next) => {
    //returns a list of all companies in the db
    try {
        const results = await db.query("SELECT code, name FROM companies");
        return res.json({ companies: results.rows });
    } catch (err) {
        next(err);
    }
});

router.get('/:code', async (req, res, next) => {
    //gets single company by its code, if not found, returns 404 error
    try {
        const { code } = req.params;
        const companyResult = await db.query("SELECT code, name, description FROM companies WHERE code = $1", [code]);
        
        if (companyResult.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        }
        res.json({ company: companyResult.rows[0] });
    } catch (err) {
        next(err);
    }
});

router.post("/", async (req, res, next) => {
    //adds new company to db
    try {
        const { name, description } = req.body;
        const code = slugify(name, { lower: true, strict: true });
        const result = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [code, name, description]);
        res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        console.error(err.detail);
        next(new ExpressError("Failed to create company", 500));
    }
});

router.put("/:code", async (req, res, next) => {
    //updates an existing company
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const result = await db.query("UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description", [name, description, code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        }
        res.json({ company: result.rows[0] });
    } catch (err) {
        next(err);
    }
});

router.delete("/:code", async (req, res, next) => {
    //deletes a company
    try {
        const { code } = req.params;
        const result = await db.query("DELETE FROM companies WHERE code = $1 RETURNING code", [code]);
        if (result.rows.length === 0) {
            throw new ExpressError(`No such company: ${code}`, 404)
        }
        await db.query("DELETE FROM companies WHERE code = $1", [code]);
        res.json({ status: 'deleted' });
    } catch (err) {
        next(err);
    }
});

module.exports = router;