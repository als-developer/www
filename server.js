const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            imgSrc: ["'self'", "data:", "https://files.catbox.moe"],
            connectSrc: ["'self'"],
            frameSrc: ["'none'"],
            objectSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// Serve static files
app.use(express.static(path.join(__dirname, '.'), {
    maxAge: '1d',
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// Helper function to inject favicon into HTML if missing
function injectFavicon(html) {
    const faviconLink = '<link rel="icon" href="https://files.catbox.moe/6yf2rn.png" type="image/png">';
    if (!html.includes('favicon') && !html.includes('icon')) {
        return html.replace('</head>', `${faviconLink}</head>`);
    }
    return html;
}

// Main route
app.get('/', (req, res) => {
    const indexPath = path.join(__dirname, 'index.html');
    
    if (fs.existsSync(indexPath)) {
        let html = fs.readFileSync(indexPath, 'utf8');
        html = injectFavicon(html);
        res.send(html);
    } else {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head><title>404 - File Not Found</title></head>
            <body style="font-family: monospace; padding: 2rem;">
                <h1>❌ index.html not found</h1>
                <p>Please save your HTML file as <strong>index.html</strong> in the same directory as server.js</p>
                <hr>
                <small>AILifeSolution Server v1.0</small>
            </body>
            </html>
        `);
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch-all for 404
app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>404 - Page Not Found</title></head>
        <body style="font-family: monospace; padding: 2rem;">
            <h1>404 - Page Not Found</h1>
            <p>The requested resource could not be found.</p>
            <a href="/">← Back to Home</a>
        </body>
        </html>
    `);
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>500 - Server Error</title></head>
        <body style="font-family: monospace; padding: 2rem;">
            <h1>500 - Internal Server Error</h1>
            <p>Something went wrong. Please try again later.</p>
        </body>
        </html>
    `);
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ╔══════════════════════════════════════════════════════╗
    ║                                                      ║
    ║     🚀 AILifeSolution Server is running!            ║
    ║                                                      ║
    ║     📡 Local:  http://localhost:${PORT}                ║
    ║     🌐 Network: http://${getLocalIP()}:${PORT}         ║
    ║                                                      ║
    ║     📁 Serving: ${path.basename(__dirname)}            ║
    ║     ✅ Status:  Online                               ║
    ║                                                      ║
    ╚══════════════════════════════════════════════════════╝
    `);
});

// Helper to get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}
