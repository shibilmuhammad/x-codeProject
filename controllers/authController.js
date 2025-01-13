const bcrypt = require("bcryptjs");

const users = [
  {
    email: "admin@gmail.com",
    password: "$2a$10$NodAdycAWIhEyuVYptuCzO/yIz5IeNZbXh0PW2uKAW6nlEQH5fXUS",
  }, // Password: 'password123'
];
const loginController = (req, res) => {
  const { email, password } = req.body;

  const user = users.find((u) => u.email === email);

  if (!user) {
    return res.render("login", { errorMsg: "Admin does not exist" });
  }

  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err) throw err;
    if (!isMatch) {
      return res.render("login", { errorMsg: "Incorrect password" });
    }

    req.session.userId = user.email;
    return res.redirect("/dashboard");
  });
};

module.exports = {
  loginController,
};
