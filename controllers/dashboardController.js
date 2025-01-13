const path = require("path");
const QRCode = require("qrcode");
const sql = require("mssql");
const { config } = require("../models/db");
const fs = require("fs"); //
const moment = require("moment");

const { getSettingsDetails } = require("../utils/settings");
const { generatePdfFromHtml, getVoucherByCode } = require("../utils/voucher");

const getVoucherDetailsFromCode = async (req, res) => {
  try {
    const { code } = req.params;
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("code", sql.NVarChar, code)
      .query("SELECT * FROM vouchers WHERE code = @code");

    res.json(result.recordset[0]);
  } catch (error) {
    console.error("Error fetching voucher by code:", error);
    throw error;
  }
};

const getDashboard = async (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/login");
  }
  const pool = await sql.connect(config); // Use your DB config
  const result = await pool.request().query("SELECT * FROM vouchers");
  const vouchers = result.recordset.map((voucher) => ({
    ...voucher,
    generated_date: moment(voucher.generated_date).format("ddd, DD MMM"),
    expiry_date: moment(voucher.expiry_date).format("ddd, DD MMM"),
  }));
  res.render("dashboard", {
    title: "Dashboard",
    activePage: "dashboard",
    vouchers: vouchers,
  });
};

const generateCode = (req, res) => {
  const code = Math.floor(1000000000 + Math.random() * 9000000000).toString(); // Generate 10-digit code
  res.json({ code });
};
const createVoucher = async (req, res) => {
  const { title, code, offer_percentage, expiry_date } = req.body;
  try {
    const qrPath = path.join(
      __dirname,
      "..",
      "public",
      "assets",
      "qrcodes",
      `${code}.png`
    );
    await QRCode.toFile(qrPath, code);

    const pool = await sql.connect(config);
    await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("code", sql.NVarChar, code)
      .input("offer_percentage", sql.Int, offer_percentage)
      .input("expiry_date", sql.DateTime, expiry_date)
      .input("generated_date", sql.DateTime, new Date())
      .input("qr_code_path", sql.NVarChar, `${code}.png`).query(`
            INSERT INTO vouchers (title, code, offer_percentage, expiry_date, generated_date, qr_code_path)
            VALUES (@title, @code, @offer_percentage, @expiry_date, @generated_date, @qr_code_path)
        `);

    res.json({ message: "success" });
  } catch (err) {
    console.log("error is ", err);
  }
};

const generatePdf = async (req, res) => {
  try {
    const filename = await generatePdfFromHtml(req);
    res.contentType("application/pdf");

    res.sendFile(filename, (err) => {
      if (err) {
        console.error("Error sending PDF:", err);
        return res.status(500).send("Error sending PDF");
      }
      // Cleanup the file after it has been sent to the client
      try {
        fs.unlinkSync(filename);
        console.log("PDF file deleted successfully after sending.");
      } catch (unlinkErr) {
        console.error("Error deleting the PDF file:", unlinkErr);
      }
    });
  } catch (error) {
    console.error("Error generating or sending PDF:", error);
    res.status(500).send("Error generating or sending PDF");
  }
};

const createVoucherTemplate = async (req, res) => {
  try {
    const { code } = req.params;
    const settings = await getSettingsDetails();
    const voucher = await getVoucherByCode(code);
    if (!voucher) {
      return res.status(404).send("Voucher not found");
    }
    res.render("voucher-template", { voucher, settings });
  } catch (error) {
    console.error("Error in createVoucherTemplate:", error);
    res.status(500).send("An error occurred while processing the voucher.");
  }
};

module.exports = {
  getDashboard,
  generateCode,
  createVoucher,
  generatePdf,
  getVoucherDetailsFromCode,
  createVoucherTemplate,
};
