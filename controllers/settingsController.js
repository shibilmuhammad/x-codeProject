const sql = require('mssql');
const { config } = require('../models/db');

const getSettingsPage = (req, res) => {
  res.render("settings", {
    title: "Settings",
    activePage: "settings",
  });
};
const getSettingsDetails = async (req, res) => {
  try {
    const result = await sql.query('SELECT * FROM Settings WHERE id = 1');
    const settings = result.recordset[0];
    res.status(200).json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching settings');
  }
}

const postSettings = async (req, res) => {
  const { max_expiry_time, voucher_width, voucher_height, title_font_size, text_font_size } = req.body;

  try {
      await sql.query(`
        MERGE Settings AS target
        USING (SELECT 1 AS id) AS source
        ON target.id = source.id
        WHEN MATCHED THEN
          UPDATE SET 
            max_expiry_time = ${max_expiry_time},
            voucher_width = ${voucher_width},
            voucher_height = ${voucher_height},
            title_font_size = ${title_font_size},
            text_font_size = ${text_font_size}
        WHEN NOT MATCHED THEN
          INSERT (max_expiry_time, voucher_width, voucher_height, title_font_size, text_font_size)
          VALUES (${max_expiry_time}, ${voucher_width}, ${voucher_height}, ${title_font_size}, ${text_font_size});
      `);

    res.status(200).send('Settings saved successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error saving settings');
  }
};



module.exports = {
  getSettingsPage,
  postSettings,
  getSettingsDetails
};
