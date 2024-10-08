require('dotenv').config(); 

module.exports = {
  db: {
    uri: process.env.MONGO_URI, 
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET
  }
};
