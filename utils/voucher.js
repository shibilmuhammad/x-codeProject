
const { getSettingsDetails } = require("./settings");
const sql = require("mssql");
const { config } = require("../models/db");
const path = require("path");
const puppeteer = require('puppeteer');
const fs = require("fs"); // 
async function generatePdfFromHtml(req) {
    try {
      const { code } = req.params;
      const voucher = await getVoucherByCode(code); 
      const settings = await getSettingsDetails();
      if (!voucher) {
        throw new Error("Voucher not found");
      }
  
      const filename = path.join(
        __dirname,
        "..",
        "public",
        "temp",
        `voucher-${code}.pdf`
      ); 
  
      const tempDir = path.join(__dirname, "..", "public", "temp");
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true }); 
      }
  
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/google-chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
      const page = await browser.newPage();
  
      try {
        await page.goto(`https://xcode.identitie.in/voucher-template/${code}`, {
          waitUntil: "networkidle0",
          timeout: 30000,
        });
      } catch (gotoError) {
        console.error("Error navigating to page:", gotoError);
        await browser.close();
        throw new Error("Error loading voucher template");
      }
      try {
        await page.pdf({
          path: filename,
          width: settings.voucher_width,
          height: settings.voucher_height,
          printBackground: true,
        });
        console.log("PDF generated successfully.");
      } catch (pdfError) {
        console.error("Error generating PDF:", pdfError);
        await browser.close();
        throw new Error("Error generating PDF");
      }
  
      await browser.close();
  
      return filename; 
    } catch (error) {
      console.error("Error in PDF generation:", error);
      throw new Error("Internal Server Error");
    }
}

async function getVoucherByCode(code) {
  try {
    const pool = await sql.connect(config);
    const result = await pool
      .request()
      .input("code", sql.NVarChar, code)
      .query("SELECT * FROM vouchers WHERE code = @code");

    return result.recordset[0];
  } catch (error) {
    console.error("Error fetching voucher by code:", error);
    throw error;
  }
}
  module.exports = {
    generatePdfFromHtml,
    getVoucherByCode
  }