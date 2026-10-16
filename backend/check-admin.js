require("dotenv").config();

const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the SAME password you use on login: ", async (password) => {
  const usernameOk = process.env.ADMIN_USERNAME === "renuka";

  const passwordOk = await bcrypt.compare(
    password,
    process.env.ADMIN_PASSWORD_HASH
  );

  console.log("Username correct:", usernameOk);
  console.log("Password correct:", passwordOk);

  rl.close();
});