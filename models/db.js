const sql = require('mssql');

const config = {
    user: 'SA',
    password: 'Shibil@8943',
    server: 'localhost',
    database: 'VoucherDB',
    options: {
        encrypt: true,
        trustServerCertificate: true 
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
};

module.exports = { sql, connectDB ,config};
