const sql = require('mssql');
const getSettingsDetails = async () => {
    try {
      const result = await sql.query('SELECT * FROM Settings WHERE id = 1');
      return result.recordset[0];  
    } catch (err) {
      console.error("Error fetching settings:", err);
      throw new Error('Error fetching settings');  
    }
  };

  module.exports = {getSettingsDetails}