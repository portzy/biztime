// db.js

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || "postgresql://localhost/biztime"
});

module.exports = {
    query: (text, params) => pool.query(text, params),
    close: () => pool.end() 
};
