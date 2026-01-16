const express = require('express');
const router = express.Router();
const stripe = require('stripe');
const config = require('../config/config');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/payments/stripe/balance
 * @desc    Obter saldo e transações do Stripe
 * @access  Private
 */
router.get('/stripe/balance',
    authenticate,
    asyncHandler(async (req, res) => {
        const stripeClient = stripe(config.stripe.secret);
        
        const balance = await stripeClient.balance.retrieve();
        const charges = await stripeClient.charges.list({ limit: 10 });
        const customers = await stripeClient.customers.list({ limit: 10 });
        
        res.json({ 
            success: true, 
            balance, 
            charges: charges.data, 
            customers: customers.data 
        });
    })
);

module.exports = router;
