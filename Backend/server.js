const dotenv = require('dotenv');
dotenv.config();

const app = require('./src/app');
const dbconnect = require('./src/database/a');

dbconnect();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

// Configure server timeouts to prevent ERR_CONNECTION_RESET during large video uploads
server.timeout = 300000; // 5 minutes
server.headersTimeout = 310000; // 5.1 minutes
server.keepAliveTimeout = 120000; // 2 minutes