const express = require('express');
const router = express.Router();
const { loginController } = require('../controllers/authController');


router.get('/login', (req, res) => {
  res.render('login', { errorMsg: null });
});

router.post('/login', loginController);



// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

module.exports = router;
