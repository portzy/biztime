const express = require('express');
const router = express.Router();
const db = require('../db'); 
const ExpressError = require("../expressError");

router.get('/industries', async (req, res, next) => {
    //get all industries with companies
    try {
        const results = db.query("SELECT i.industry, ARRAY_AGG(ci.company_code) AS companies FROM industries i JOIN company_industries ci ON i.code = ci.industry_code GROUP BY i.industry");
        res.json({ industries: results.rows });
    } catch (err) {
        next(err);
    }
});

router.post('/industries', async(req, res, next) => {
    //create new industry
    try {
        const { code, industry } = req.body;
        const result = await db.query(
            "INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry",
            [code, industry]
        );
        res.status(201).json({ industry: result.rows[0] });
    } catch(err) {
        next(err);
    }
});

router.post('/industries', async(req, res, next) => {
    //create new industry
    try {
        const { code, industry } = req.body;
        const result = await db.query(
            "INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2) RETURNING company_code, industry_code",
            [code, industryCode]
        );
        res.status(201).json({ association: result.rows[0] });
    } catch(err) {
        next(err);
    }
});
