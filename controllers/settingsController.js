const sql = require('mssql');

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
  console.log('req.body',req.body);
  try {
    await sql.query(`
      UPDATE Settings
      SET 
        max_expiry_time = ${max_expiry_time},
        voucher_width = ${voucher_width},
        voucher_height = ${voucher_height},
        title_font_size = ${title_font_size},
        text_font_size = ${text_font_size}
      WHERE id = 1
    `);
    res.status(200).send('Settings updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating settings');
  }
};

module.exports = {
  getSettingsPage,
  postSettings,
  getSettingsDetails
};
