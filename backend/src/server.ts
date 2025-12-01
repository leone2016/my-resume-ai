import express from 'express';
import cors from 'cors';
import path from 'path';
import router from './routes';

const app = express();
const PORT = 1991;

// Middleware
app.use(cors()); // Allow all CORS by default for development
app.use(express.json({ limit: '50mb' })); // Increase limit for large LaTeX payloads

// Static files
app.use('/pdfs', express.static(path.join(__dirname, '../public/pdfs')));

// Routes
app.use('/', router);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
