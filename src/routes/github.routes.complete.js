const express = require('express');
const router = express.Router();
const { Octokit } = require('@octokit/rest');
const config = require('../config/config');
const { authenticate } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Instância do Octokit
const getOctokit = () => new Octokit({ auth: config.github.token });

/**
 * @route   GET /api/github/repos
 * @desc    Listar repositórios do usuário
 * @access  Private
 */
router.get('/repos',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            sort: 'updated',
            per_page: 50,
            affiliation: 'owner,collaborator,organization_member'
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
        const octokit = getOctokit();
        
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

/**
 * @route   GET /api/github/issues
 * @desc    Listar issues atribuídas ao usuário
 * @access  Private
 */
router.get('/issues',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: issues } = await octokit.issues.listForAuthenticatedUser({
            filter: 'assigned',
            state: 'open',
            sort: 'updated',
            per_page: 50
        });
        
        res.json({ 
            success: true, 
            issues,
            count: issues.length
        });
    })
);

/**
 * @route   GET /api/github/pulls
 * @desc    Listar Pull Requests do usuário
 * @access  Private
 */
router.get('/pulls',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: user } = await octokit.users.getAuthenticated();
        
        // Busca PRs em todos os repos do usuário
        const { data: repos } = await octokit.repos.listForAuthenticatedUser({
            per_page: 100
        });
        
        const pullRequests = [];
        
        // Busca PRs de cada repositório (limitado aos primeiros 10 repos para performance)
        for (const repo of repos.slice(0, 10)) {
            try {
                const { data: prs } = await octokit.pulls.list({
                    owner: repo.owner.login,
                    repo: repo.name,
                    state: 'open',
                    per_page: 10
                });
                
                pullRequests.push(...prs.map(pr => ({
                    ...pr,
                    repository: repo.name
                })));
            } catch (error) {
                // Ignora repos sem acesso
                continue;
            }
        }
        
        res.json({ 
            success: true, 
            pulls: pullRequests,
            count: pullRequests.length
        });
    })
);

/**
 * @route   GET /api/github/gists
 * @desc    Listar Gists do usuário
 * @access  Private
 */
router.get('/gists',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: gists } = await octokit.gists.list({
            per_page: 50
        });
        
        res.json({ 
            success: true, 
            gists,
            count: gists.length
        });
    })
);

/**
 * @route   GET /api/github/notifications
 * @desc    Listar notificações
 * @access  Private
 */
router.get('/notifications',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: notifications } = await octokit.activity.listNotificationsForAuthenticatedUser({
            per_page: 50
        });
        
        res.json({ 
            success: true, 
            notifications,
            count: notifications.length,
            unread: notifications.filter(n => n.unread).length
        });
    })
);

/**
 * @route   GET /api/github/starred
 * @desc    Listar repositórios com star
 * @access  Private
 */
router.get('/starred',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: starred } = await octokit.activity.listReposStarredByAuthenticatedUser({
            per_page: 50,
            sort: 'created'
        });
        
        res.json({ 
            success: true, 
            starred,
            count: starred.length
        });
    })
);

/**
 * @route   GET /api/github/organizations
 * @desc    Listar organizações do usuário
 * @access  Private
 */
router.get('/organizations',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        const { data: orgs } = await octokit.orgs.listForAuthenticatedUser({
            per_page: 50
        });
        
        res.json({ 
            success: true, 
            organizations: orgs,
            count: orgs.length
        });
    })
);

/**
 * @route   GET /api/github/workflow-runs/:owner/:repo
 * @desc    Listar execuções de GitHub Actions
 * @access  Private
 */
router.get('/workflow-runs/:owner/:repo',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        const { owner, repo } = req.params;
        
        const { data } = await octokit.actions.listWorkflowRunsForRepo({
            owner,
            repo,
            per_page: 20
        });
        
        res.json({ 
            success: true, 
            workflow_runs: data.workflow_runs,
            count: data.total_count
        });
    })
);

/**
 * @route   GET /api/github/stats
 * @desc    Estatísticas completas do GitHub
 * @access  Private
 */
router.get('/stats',
    authenticate,
    asyncHandler(async (req, res) => {
        const octokit = getOctokit();
        
        // Busca dados em paralelo
        const [
            { data: user },
            { data: repos },
            { data: issues },
            { data: gists },
            { data: starred },
            { data: orgs }
        ] = await Promise.all([
            octokit.users.getAuthenticated(),
            octokit.repos.listForAuthenticatedUser({ per_page: 100 }),
            octokit.issues.listForAuthenticatedUser({ state: 'open', per_page: 100 }),
            octokit.gists.list({ per_page: 100 }),
            octokit.activity.listReposStarredByAuthenticatedUser({ per_page: 100 }),
            octokit.orgs.listForAuthenticatedUser({ per_page: 100 })
        ]);
        
        // Calcula estatísticas
        const stats = {
            user: {
                login: user.login,
                name: user.name,
                avatar: user.avatar_url,
                followers: user.followers,
                following: user.following,
                public_repos: user.public_repos,
                public_gists: user.public_gists
            },
            repos: {
                total: repos.length,
                public: repos.filter(r => !r.private).length,
                private: repos.filter(r => r.private).length,
                forked: repos.filter(r => r.fork).length,
                total_stars: repos.reduce((sum, r) => sum + r.stargazers_count, 0),
                total_forks: repos.reduce((sum, r) => sum + r.forks_count, 0),
                languages: [...new Set(repos.map(r => r.language).filter(l => l))]
            },
            issues: {
                open: issues.length,
                assigned: issues.filter(i => i.assignee).length
            },
            gists: {
                total: gists.length,
                public: gists.filter(g => g.public).length
            },
            starred: {
                total: starred.length
            },
            organizations: {
                total: orgs.length,
                list: orgs.map(o => ({ login: o.login, avatar: o.avatar_url }))
            }
        };
        
        res.json({ 
            success: true, 
            stats
        });
    })
);

module.exports = router;