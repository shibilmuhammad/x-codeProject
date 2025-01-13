const express = require('express')
const router = express.Router();
const {getDashboard ,generateCode ,createVoucher ,generatePdf ,createVoucherTemplate, getVoucherDetailsFromCode } = require('../controllers/dashboardController')


router.get('/dashboard', getDashboard);
router.get('/generate-code', generateCode)
router.post('/create-voucher',createVoucher)
router.get('/voucher-template/:code', createVoucherTemplate);
router.get('/vouchers/:code',getVoucherDetailsFromCode)

router.get('/voucher/:code/pdf',generatePdf)
module.exports = router ;