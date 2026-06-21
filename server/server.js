import dotenv from 'dotenv';
import app from './src/app.js';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`📡 RupeeRadar Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
