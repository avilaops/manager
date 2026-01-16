import Stripe from 'stripe';
import logger from '../utils/logger.js';

const stripe = new Stripe(process.env.STRIPE_API_TOKEN);

/**
 * Stripe Webhook Handler
 * Handles webhook events from Stripe for payments
 */

// Verify Stripe webhook signature
export const verifyStripeSignature = (req, res, next) => {
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
        logger.warn('Stripe webhook secret not configured');
        return next();
    }
    
    try {
        const event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            endpointSecret
        );
        req.stripeEvent = event;
        next();
    } catch (err) {
        logger.error('Stripe webhook signature verification failed:', err);
        return res.status(400).json({
            success: false,
            error: `Webhook Error: ${err.message}`
        });
    }
};

// Handle Stripe webhook events
export const handleStripeWebhook = async (req, res) => {
    const event = req.stripeEvent || req.body;
    
    logger.info(`Stripe webhook received: ${event.type}`, {
        id: event.id
    });
    
    try {
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentIntentSucceeded(event.data.object);
                break;
                
            case 'payment_intent.payment_failed':
                await handlePaymentIntentFailed(event.data.object);
                break;
                
            case 'charge.succeeded':
                await handleChargeSucceeded(event.data.object);
                break;
                
            case 'charge.failed':
                await handleChargeFailed(event.data.object);
                break;
                
            case 'customer.created':
                await handleCustomerCreated(event.data.object);
                break;
                
            case 'customer.updated':
                await handleCustomerUpdated(event.data.object);
                break;
                
            case 'customer.deleted':
                await handleCustomerDeleted(event.data.object);
                break;
                
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;
                
            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;
                
            case 'subscription.created':
                await handleSubscriptionCreated(event.data.object);
                break;
                
            case 'subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;
                
            case 'subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;
                
            default:
                logger.info(`Unhandled Stripe event: ${event.type}`);
        }
        
        res.status(200).json({
            success: true,
            received: true
        });
        
    } catch (error) {
        logger.error('Error processing Stripe webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};

// Payment Intent Succeeded
async function handlePaymentIntentSucceeded(paymentIntent) {
    logger.info('Payment succeeded', {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency
    });
    
    // Update database
    // Send confirmation email
    // Update order status
    // TODO: Implement your business logic here
}

// Payment Intent Failed
async function handlePaymentIntentFailed(paymentIntent) {
    logger.error('Payment failed', {
        id: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        error: paymentIntent.last_payment_error?.message
    });
    
    // Send failure notification
    // Log for investigation
    // TODO: Implement your business logic here
}

// Charge Succeeded
async function handleChargeSucceeded(charge) {
    logger.info('Charge succeeded', {
        id: charge.id,
        amount: charge.amount / 100,
        customer: charge.customer
    });
    
    // Update payment record
    // Send receipt
    // TODO: Implement your business logic here
}

// Charge Failed
async function handleChargeFailed(charge) {
    logger.error('Charge failed', {
        id: charge.id,
        amount: charge.amount / 100,
        failure_message: charge.failure_message
    });
    
    // Notify customer
    // Log for investigation
    // TODO: Implement your business logic here
}

// Customer Created
async function handleCustomerCreated(customer) {
    logger.info('Customer created', {
        id: customer.id,
        email: customer.email
    });
    
    // Add to CRM
    // Send welcome email
    // TODO: Implement your business logic here
}

// Customer Updated
async function handleCustomerUpdated(customer) {
    logger.info('Customer updated', {
        id: customer.id,
        email: customer.email
    });
    
    // Update CRM
    // TODO: Implement your business logic here
}

// Customer Deleted
async function handleCustomerDeleted(customer) {
    logger.info('Customer deleted', {
        id: customer.id
    });
    
    // Archive in CRM
    // TODO: Implement your business logic here
}

// Invoice Payment Succeeded
async function handleInvoicePaymentSucceeded(invoice) {
    logger.info('Invoice payment succeeded', {
        id: invoice.id,
        amount: invoice.amount_paid / 100,
        customer: invoice.customer
    });
    
    // Send invoice receipt
    // Update subscription status
    // TODO: Implement your business logic here
}

// Invoice Payment Failed
async function handleInvoicePaymentFailed(invoice) {
    logger.error('Invoice payment failed', {
        id: invoice.id,
        amount: invoice.amount_due / 100,
        customer: invoice.customer
    });
    
    // Notify customer
    // Update subscription status
    // TODO: Implement your business logic here
}

// Subscription Created
async function handleSubscriptionCreated(subscription) {
    logger.info('Subscription created', {
        id: subscription.id,
        customer: subscription.customer,
        status: subscription.status
    });
    
    // Activate subscription features
    // Send confirmation email
    // TODO: Implement your business logic here
}

// Subscription Updated
async function handleSubscriptionUpdated(subscription) {
    logger.info('Subscription updated', {
        id: subscription.id,
        customer: subscription.customer,
        status: subscription.status
    });
    
    // Update subscription features
    // Notify customer of changes
    // TODO: Implement your business logic here
}

// Subscription Deleted
async function handleSubscriptionDeleted(subscription) {
    logger.info('Subscription deleted', {
        id: subscription.id,
        customer: subscription.customer
    });
    
    // Deactivate subscription features
    // Send cancellation confirmation
    // TODO: Implement your business logic here
}

export default {
    verifyStripeSignature,
    handleStripeWebhook
};
