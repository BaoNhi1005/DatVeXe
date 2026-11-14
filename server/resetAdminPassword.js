const readline = require("readline/promises");
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function resetPassword() {
  try {
    const password = await rl.question(
      "Nhap mat khau Admin moi (toi thieu 12 ky tu): ",
    );

    if (password.length < 12) {
      throw new Error("Mat khau phai co it nhat 12 ky tu!");
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.execute(
      `UPDATE user_db.users
       SET password_hash = ?
       WHERE id = 1 AND role_id = 1`,
      [hash],
    );

    console.log("Da cap nhat mat khau Admin!");
    console.log("Do dai hash:", hash.length);
  } catch (error) {
    console.error("Loi:", error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

resetPassword();
//admin10052005
