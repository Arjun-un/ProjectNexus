const crypto = require('crypto');
const Project = require('../models/Project');

/**
 * Middleware: verifyGithubSignature
 * Validates GitHub's X-Hub-Signature-256 header using timing-safe HMAC-SHA256 comparison.
 * Never leaks project existence or secret presence on failure (returns 401).
 */
const verifyGithubSignature = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const signature = req.headers['x-hub-signature-256'];

    if (!projectId || !signature) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Missing webhook credentials or signature header'
      });
    }

    // Look up project by MongoDB ObjectId or human Project ID, explicitly requesting the hidden secret
    const cleanId = String(projectId).trim();
    let query;
    if (cleanId.match(/^[0-9a-fA-F]{24}$/)) {
      query = { _id: cleanId };
    } else {
      query = {
        $or: [
          { projectId: cleanId.toUpperCase() },
          { projectId: cleanId }
        ]
      };
    }

    const project = await Project.findOne(query).select('+githubIntegration.webhookSecret');

    if (!project || !project.githubIntegration?.webhookSecret) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Webhook verification failed'
      });
    }

    // Extract raw payload buffer (attached by express.json verify callback or fallback)
    let rawBodyBuffer = req.rawBody;
    if (!rawBodyBuffer) {
      if (Buffer.isBuffer(req.body)) {
        rawBodyBuffer = req.body;
      } else if (typeof req.body === 'string') {
        rawBodyBuffer = Buffer.from(req.body, 'utf8');
      } else if (req.body && typeof req.body === 'object') {
        rawBodyBuffer = Buffer.from(JSON.stringify(req.body), 'utf8');
      } else {
        rawBodyBuffer = Buffer.from('');
      }
    }

    const secret = project.githubIntegration.webhookSecret;
    const computedSignature = 'sha256=' + crypto
      .createHmac('sha256', secret)
      .update(rawBodyBuffer)
      .digest('hex');

    const expectedBuffer = Buffer.from(computedSignature, 'utf8');
    const receivedBuffer = Buffer.from(signature, 'utf8');

    // Timing-safe comparison to prevent side-channel timing attacks
    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Webhook signature mismatch'
      });
    }

    // Attach validated project to request context
    req.project = project;
    next();
  } catch (error) {
    console.error('[verifyGithubSignature Error]:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Webhook verification error'
    });
  }
};

module.exports = verifyGithubSignature;
