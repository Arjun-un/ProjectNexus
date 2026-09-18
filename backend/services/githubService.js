const axios = require('axios');

/**
 * Parses GitHub repository URL or slug into owner and repository name
 * Handles:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - owner/repo
 */
const parseRepoUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  const clean = url.trim().replace(/\.git$/i, '').replace(/\/+$/, '');

  // SSH style git@github.com:owner/repo
  const sshMatch = clean.match(/github\.com[:/]([^/]+)\/([^/]+)$/i);
  if (sshMatch) {
    return {
      owner: sshMatch[1],
      repo: sshMatch[2],
      cleanUrl: `https://github.com/${sshMatch[1]}/${sshMatch[2]}`
    };
  }

  // Plain owner/repo
  const slugMatch = clean.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/);
  if (slugMatch) {
    return {
      owner: slugMatch[1],
      repo: slugMatch[2],
      cleanUrl: `https://github.com/${slugMatch[1]}/${slugMatch[2]}`
    };
  }

  return null;
};

/**
 * Validates repository accessibility via GitHub REST API
 * and optionally backfills initial commits and contributors
 */
const validateAndBackfillRepo = async (owner, repo) => {
  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'ProjectNexus-Academic-OS'
  };

  try {
    // 1. Validate repository existence and accessibility
    const repoRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      timeout: 8000
    });

    const repoData = repoRes.data;

    let contributors = [];
    let totalCommits = 0;
    let lastCommitSha = '';

    // 2. Backfill recent commits (last 30)
    try {
      const commitsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits?per_page=30`, {
        headers,
        timeout: 8000
      });

      const commits = Array.isArray(commitsRes.data) ? commitsRes.data : [];
      totalCommits = commits.length;
      if (commits.length > 0) {
        lastCommitSha = commits[0].sha;
      }

      // Map unique contributors from commits
      const contributorMap = new Map();

      commits.forEach((item) => {
        const author = item.commit?.author || {};
        const login = item.author?.login || author.name || 'Contributor';
        const email = (author.email || '').toLowerCase().trim();
        const key = email || login.toLowerCase();

        if (!contributorMap.has(key)) {
          contributorMap.set(key, {
            name: author.name || login,
            email: email,
            githubUsername: item.author?.login || '',
            commitCount: 1,
            linesAdded: 0,
            linesRemoved: 0,
            lastCommitAt: author.date ? new Date(author.date) : new Date()
          });
        } else {
          const existing = contributorMap.get(key);
          existing.commitCount += 1;
        }
      });

      contributors = Array.from(contributorMap.values());
    } catch (commitErr) {
      console.warn(`[GitHub Service] Note: Could not backfill commits for ${owner}/${repo}: ${commitErr.message}`);
    }

    // 3. Backfill top contributors if available
    try {
      const contribRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=10`, {
        headers,
        timeout: 8000
      });

      if (Array.isArray(contribRes.data)) {
        contribRes.data.forEach((c) => {
          const found = contributors.find(
            (item) => (item.githubUsername && item.githubUsername.toLowerCase() === c.login.toLowerCase())
          );
          if (found) {
            if (c.contributions > found.commitCount) {
              found.commitCount = c.contributions;
            }
          } else {
            contributors.push({
              name: c.login,
              email: '',
              githubUsername: c.login,
              commitCount: c.contributions || 1,
              linesAdded: 0,
              linesRemoved: 0,
              lastCommitAt: new Date()
            });
          }
        });
      }
    } catch (contribErr) {
      console.warn(`[GitHub Service] Note: Could not backfill contributors API for ${owner}/${repo}: ${contribErr.message}`);
    }

    return {
      valid: true,
      repoData: {
        id: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        owner: repoData.owner?.login || owner,
        isPrivate: repoData.private,
        htmlUrl: repoData.html_url,
        description: repoData.description || '',
        defaultBranch: repoData.default_branch || 'main',
        stargazersCount: repoData.stargazers_count || 0,
        forksCount: repoData.forks_count || 0,
        openIssuesCount: repoData.open_issues_count || 0
      },
      totalCommits,
      lastCommitSha,
      contributors
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        valid: false,
        error: 'Repository not found or not accessible. Make sure it is public or grant access.'
      };
    }
    if (error.response?.status === 403) {
      return {
        valid: false,
        error: 'GitHub API rate limit exceeded or access denied. Please verify the repository URL.'
      };
    }
    return {
      valid: false,
      error: error.message || 'Failed to connect to GitHub repository.'
    };
  }
};

module.exports = {
  parseRepoUrl,
  validateAndBackfillRepo
};
