const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res, next) => {
    //returns a list of all companies in the db
    try {
        const results = await db.query("SELECT code, name FROM companies");
        return res.json({companies: results.rows});
    } catch (err) {
        return next(err);
    }
})

router.get('/:code', async (req, res, next) => {
    //gets single company by its code, if not found, returns 404 error
    try {
        const { code } = req.params;
        const companyResult = await db.query("SELECT code, name, description FROM companies WHERE code = $1", [code]);

        if (companyResult.rows.length === 0){
            throw new ExpressError('Company not found', 404);
        }
        return res.json({company: companyResult.rows[0]});
    } catch (err) {
        return next(err);
    }
})

router.post("/", async (req, res, next) => {
    //adds new company to db
    try {
        const { code, name, description } = req.body;
        const result = await db.query("INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description", [code, name, description]);
        return res.status(201).json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
})

router.put("/", async (req, res, next) => {
    //updates an existing company
    try {
        const { name, description } = req.body;
        const {code} = req.params;
        const result = await db.query("UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description",[name, description, code]);

        if (result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);}

        return res.json({ company: result.rows[0] });
    } catch (err) {
        return next(err);
    }
})

router.delete(router.delete("/:code", async (req, res, next) => {
    //deletes a company
    try {
        const { code } = req.params;
        const result = await db.query("DELETE FROM companies WHERE code = $1 RETURNING code", [code]);

        if (result.rows.length === 0) {
            throw new ExpressError("Company not found", 404);
        }

        return res.json({ status: 'deleted '});
    } catch (err){
        return next(err);
    }
}));

module.exports = router;
