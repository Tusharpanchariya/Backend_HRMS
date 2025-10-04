// File: src/index.ts
import dotenv from 'dotenv';
dotenv.config(); // load env first

import app from './app';
import './cron/birthdayJob';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
