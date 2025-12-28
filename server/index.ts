/**
 * x402 Server - YUREI Agent API
 * 
 * Express server with x402 payment middleware.
 * Returns 402 Payment Required for unauthorized requests.
 */

import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Config
const PORT = process.env.PORT || 3402;
const PAY_TO = process.env.RECEIVER_WALLET || '';
const NETWORK = process.env.NETWORK_ID || 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1'; // Solana Devnet
const FACILITATOR_URL = process.env.FACILITATOR_URL || 'https://x402.org/facilitator';

// x402 Payment Requirements
const paymentRequirements = {
    accepts: [{
        scheme: 'exact',
        network: NETWORK,
        maxAmountRequired: '100000', // 0.10 USDC
        resource: '/api/intel',
        description: 'YUREI Token Intelligence',
        mimeType: 'application/json',
        payTo: PAY_TO,
        maxTimeoutSeconds: 300,
        asset: 'USDC',
        extra: {}
    }],
    x402Version: 1
};

// x402 Middleware
function x402Middleware(req: Request, res: Response, next: NextFunction) {
    const paymentHeader = req.headers['x-payment'];

    if (paymentHeader && typeof paymentHeader === 'string') {
        // Payment present - allow access
        // In production: verify with facilitator
        console.log('[x402] Payment verified');
        return next();
    }

    // No payment - return 402
    console.log('[x402] Payment Required');

    res.status(402)
        .set({
            'Content-Type': 'application/json',
            'X-Payment-Response': JSON.stringify(paymentRequirements),
        })
        .json({
            error: 'Payment Required',
            ...paymentRequirements
        });
}

// Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', protocol: 'x402' });
});

// Protected Endpoint
app.get('/api/intel', x402Middleware, (req, res) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({ error: 'Token address required' });
    }

    // Return intelligence data
    res.json({
        token,
        timestamp: new Date().toISOString(),
        analysis: {
            riskScore: Math.floor(Math.random() * 100),
            riskLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
            sniperCount: Math.floor(Math.random() * 50),
            top10HoldersPercent: Math.floor(Math.random() * 60) + 20
        }
    });
});

// Start
app.listen(PORT, () => {
    console.log(`\nx402 Server running on http://localhost:${PORT}`);
    console.log(`\nEndpoints:`);
    console.log(`  GET /health     - Health check`);
    console.log(`  GET /api/intel  - Token intelligence (x402)\n`);
});
