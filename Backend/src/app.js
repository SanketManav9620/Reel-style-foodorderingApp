const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRouter = require('./routes/auth.routes');
const foodRouter = require('./routes/food.routes');
const foodPartnerRouter = require('./routes/foodpartner.routes');
const foodActionRouter = require('./routes/foodAction.routes');

const app = express();

app.use(cors({
    origin: true,
    credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '80mb' }));
app.use(express.urlencoded({ extended: true, limit: '80mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../../Frontend/public/uploads')));

// Register routes on both standard and /api prefixed routes
app.use('/auth', authRouter);
app.use('/api/auth', authRouter);

app.use('/food', foodRouter);
app.use('/api/food', foodRouter);

app.use('/food', foodActionRouter);
app.use('/api/food', foodActionRouter);

app.use('/foodpartner', foodPartnerRouter);
app.use('/api/foodpartner', foodPartnerRouter);

// JSON 404 handler (prevents returning HTML 404 pages)
app.use((req, res) => {
    res.status(404).json({ message: `API Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// JSON Global Error Handler (prevents returning HTML 500 pages)
app.use((err, req, res, next) => {
    console.error("❌ Express unhandled error:", err);
    res.status(err.status || 500).json({ message: err.message || "Internal server error" });
});

module.exports = app;
