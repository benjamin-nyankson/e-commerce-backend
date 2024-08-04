const bcrypt = require('bcrypt');


const saltRounds = 10;

 const hashPassword = async (password) => {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (err) {
    console.error('Error hashing password:', err);
    throw new Error('Internal server error');
  }
};

module.exports=hashPassword