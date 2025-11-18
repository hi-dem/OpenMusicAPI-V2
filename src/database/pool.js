const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432
});

pool.on('error', (err) => {
  console.error('Unexpected PG client error', err);
});

pool.close = () => pool.end();

module.exports = pool;