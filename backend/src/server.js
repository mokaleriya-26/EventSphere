import app from './app.js';
import { env } from './config/env.js';
import { checkDatabaseReadiness } from './config/database.js';

// Server listener
const PORT = env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log('====================================================');
  console.log(`🚀 EventSphere Backend running on port ${PORT}`);
  console.log(`🌍 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Allowed Frontend Origin: ${env.FRONTEND_URL}`);
  console.log(`🏥 Health Endpoint: http://localhost:${PORT}/api/health`);
  console.log('====================================================');

  const dbHealth = await checkDatabaseReadiness();
  if (dbHealth.isConnected) {
    console.log(`✅ Database Status: Connected (${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME})`);
  } else {
    console.warn(`⚠️ Database Notice: ${dbHealth.message}`);
    console.warn('   To configure MySQL, set DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in backend/.env');
    console.warn('   Then run: npm run migrate && npm run seed');
  }
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
