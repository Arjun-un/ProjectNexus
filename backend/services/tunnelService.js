const ngrok = require('@ngrok/ngrok');

let activeListener = null;

/**
 * Initializes public ngrok webhook tunnel for development
 * @param {number} port Local server port to expose
 */
const startTunnel = async (port) => {
  // Only start tunnel if explicitly enabled (default: true in development)
  if (process.env.ENABLE_NGROK_TUNNEL === 'false') {
    return;
  }

  const domain = process.env.NGROK_DOMAIN || 'support-shy-overcook.ngrok-free.dev';
  const authtoken = process.env.NGROK_AUTHTOKEN;

  try {
    const options = {
      addr: port,
      domain: domain
    };

    if (authtoken) {
      options.authtoken = authtoken;
    }

    activeListener = await ngrok.forward(options);
    console.log(`🌐 [ProjectNexus] Public Webhook Tunnel Active: ${activeListener.url()}`);
    console.log(`📡 Webhook Tracking Base: ${activeListener.url()}/api/webhooks/repo/<projectId>`);
  } catch (error) {
    if (error.message && error.message.includes('ERR_NGROK_334')) {
      console.log(`🌐 [ProjectNexus] Tunnel is active at https://${domain} (via existing ngrok session)`);
    } else {
      console.warn(`⚠️ [ProjectNexus] ngrok tunnel notice: ${error.message}`);
    }
  }
};

/**
 * Gracefully disconnects active tunnel on server shutdown
 */
const stopTunnel = async () => {
  if (activeListener) {
    try {
      await activeListener.close();
      activeListener = null;
    } catch {
      // Ignore cleanup error on process exit
    }
  }
};

process.once('SIGINT', async () => {
  await stopTunnel();
  process.exit(0);
});

process.once('SIGTERM', async () => {
  await stopTunnel();
  process.exit(0);
});

module.exports = {
  startTunnel,
  stopTunnel
};
