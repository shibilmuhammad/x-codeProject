const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const {connectDB} = require('./models/db')

const authRoutes = require('./routes/auth');
const settingsRoutes = require('./routes/settings');
const dashboardRoutes = require('./routes/dashboard')


const app = express();

connectDB();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use(session({
  secret: 'secret_key', 
  resave: false,
  saveUninitialized: true,
}));


app.use(authRoutes);
app.use(settingsRoutes)
app.use(dashboardRoutes)


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
