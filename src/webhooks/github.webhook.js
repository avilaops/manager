import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * GitHub Webhook Handler
 * Handles webhooks from GitHub for automated workflows
 */

// Verify GitHub webhook signature
export const verifyGitHubSignature = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'];
    const secret = process.env.GITHUB_WEBHOOK_SECRET;
    
    if (!secret) {
        logger.warn('GitHub webhook secret not configured');
        return next();
    }
    
    if (!signature) {
        logger.warn('GitHub webhook signature missing');
        return res.status(401).json({
            success: false,
            error: 'Signature required'
        });
    }
    
    const hmac = crypto.createHmac('sha256', secret);
    const digest = `sha256=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;
    
    if (signature !== digest) {
        logger.error('GitHub webhook signature invalid');
        return res.status(401).json({
            success: false,
            error: 'Invalid signature'
        });
    }
    
    next();
};

// Handle GitHub webhook events
export const handleGitHubWebhook = async (req, res) => {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    
    logger.info(`GitHub webhook received: ${event}`, {
        repository: payload.repository?.full_name,
        action: payload.action
    });
    
    try {
        switch (event) {
            case 'push':
                await handlePushEvent(payload);
                break;
                
            case 'pull_request':
                await handlePullRequestEvent(payload);
                break;
                
            case 'issues':
                await handleIssuesEvent(payload);
                break;
                
            case 'release':
                await handleReleaseEvent(payload);
                break;
                
            case 'deployment':
                await handleDeploymentEvent(payload);
                break;
                
            default:
                logger.info(`Unhandled GitHub event: ${event}`);
        }
        
        res.status(200).json({
            success: true,
            message: 'Webhook processed',
            event
        });
        
    } catch (error) {
        logger.error('Error processing GitHub webhook:', error);
        res.status(500).json({
            success: false,
            error: 'Webhook processing failed'
        });
    }
};

// Handle push events
async function handlePushEvent(payload) {
    const { repository, ref, commits } = payload;
    
    logger.info('Push event', {
        repo: repository.full_name,
        branch: ref.replace('refs/heads/', ''),
        commits: commits.length
    });
    
    // Trigger auto-deploy if push to main/master
    if (ref === 'refs/heads/main' || ref === 'refs/heads/master') {
        logger.info('Deploying to production...');
        // Add your deploy logic here
    }
}

// Handle pull request events
async function handlePullRequestEvent(payload) {
    const { action, pull_request, repository } = payload;
    
    logger.info('Pull request event', {
        action,
        repo: repository.full_name,
        pr: pull_request.number,
        title: pull_request.title
    });
    
    // Auto-review or run tests
    if (action === 'opened' || action === 'synchronize') {
        logger.info('Running automated checks...');
        // Add your CI/CD logic here
    }
}

// Handle issues events
async function handleIssuesEvent(payload) {
    const { action, issue, repository } = payload;
    
    logger.info('Issue event', {
        action,
        repo: repository.full_name,
        issue: issue.number,
        title: issue.title
    });
    
    // Auto-label or assign issues
    if (action === 'opened') {
        logger.info('New issue created, auto-processing...');
        // Add your issue management logic here
    }
}

// Handle release events
async function handleReleaseEvent(payload) {
    const { action, release, repository } = payload;
    
    logger.info('Release event', {
        action,
        repo: repository.full_name,
        tag: release.tag_name,
        name: release.name
    });
    
    // Trigger production deployment
    if (action === 'published') {
        logger.info('Release published, deploying...');
        // Add your deployment logic here
    }
}

// Handle deployment events
async function handleDeploymentEvent(payload) {
    const { deployment, repository } = payload;
    
    logger.info('Deployment event', {
        repo: repository.full_name,
        environment: deployment.environment,
        ref: deployment.ref
    });
}

export default {
    verifyGitHubSignature,
    handleGitHubWebhook
};
