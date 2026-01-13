const express = require('express');
const router = express.Router();
const { Octokit } = require('@octokit/rest');
const config = require('../config/config');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * @route   GET /api/github/repos
 * @desc    Listar repositórios do usuário
 * @access  Private
 */
router.get('/repos',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = new Octokit({ auth: config.github.token });
        
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50
        });
        
        const { data: user } = await octokit.users.getAuthenticated();
        
        res.json({ 
            success: true, 
            repos, 
            user 
        });
    })
);

/**
 * @route   GET /api/github/activity
 * @desc    Obter atividades recentes
 * @access  Private
 */
router.get('/activity',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = new Octokit({ auth: config.github.token });
        
        const { data: events } = await octokit.activity.listEventsForAuthenticatedUser({
            username: config.github.username,
            per_page: 30
        });
        
        res.json({ 
            success: true, 
            events 
        });
    })
);

module.exports = router;
