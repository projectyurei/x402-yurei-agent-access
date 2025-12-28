/**
 * x402 Client - Demo
 * 
 * Demonstrates the x402 payment flow:
 * 1. Request API
 * 2. Receive 402 Payment Required
 * 3. Pay USDC
 * 4. Retry with X-Payment header
 * 5. Receive data
 */

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3402';
const TOKEN = 'So11111111111111111111111111111111111111112';

interface PaymentRequirements {
    accepts: Array<{
        maxAmountRequired: string;
        payTo: string;
        network: string;
    }>;
}

async function demo() {
    console.log('\n=== x402 Client Demo ===\n');

    const endpoint = `${SERVER_URL}/api/intel?token=${TOKEN}`;

    // Step 1: Request without payment
    console.log('1. Requesting API...');
    const res = await fetch(endpoint);
    console.log(`   Response: ${res.status}`);

    if (res.status !== 402) {
        console.log('   Unexpected response');
        return;
    }

    // Step 2: Parse payment requirements
    const requirements: PaymentRequirements = await res.json();
    const amount = Number(requirements.accepts[0]?.maxAmountRequired || 0) / 1000000;
    console.log(`\n2. Payment Required: ${amount} USDC`);
    console.log(`   Network: ${requirements.accepts[0]?.network}`);

    // Step 3: Simulate payment
    console.log('\n3. Signing transaction...');
    await new Promise(r => setTimeout(r, 1000));

    const paymentProof = Buffer.from(JSON.stringify({
        signature: 'demo_' + Date.now(),
        amount: requirements.accepts[0].maxAmountRequired
    })).toString('base64');

    console.log('   Payment simulated');

    // Step 4: Retry with payment
    console.log('\n4. Retrying with X-Payment header...');
    const paidRes = await fetch(endpoint, {
        headers: { 'X-Payment': paymentProof }
    });
    console.log(`   Response: ${paidRes.status}`);

    if (!paidRes.ok) {
        console.log('   Payment rejected');
        return;
    }

    // Step 5: Receive data
    const data = await paidRes.json();
    console.log('\n5. Intelligence Data:');
    console.log(`   Token: ${data.token.slice(0, 12)}...`);
    console.log(`   Risk: ${data.analysis.riskScore}/100 (${data.analysis.riskLevel})`);
    console.log(`   Snipers: ${data.analysis.sniperCount}`);

    console.log('\n=== Demo Complete ===\n');
}

demo().catch(console.error);
