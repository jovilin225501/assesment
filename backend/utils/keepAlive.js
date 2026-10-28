/**
 * Render Keep-Alive / Heartbeat Utility
 * Render free tier web services spin down after 15 minutes of inactivity.
 * This utility automatically pings /api/health every 13 minutes when deployed on Render,
 * keeping the service warm and responsive for visitors and examiners.
 */
const startKeepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL;
  if (!url) return;

  const PING_INTERVAL = 13 * 60 * 1000; // 13 minutes

  console.log(`[KeepAlive] Heartbeat active for Render deployment: ${url}`);
  setInterval(async () => {
    try {
      const res = await fetch(`${url}/api/health`);
      console.log(`[KeepAlive] Heartbeat ping sent -> status: ${res.status}`);
    } catch (err) {
      console.warn(`[KeepAlive] Heartbeat ping failed: ${err.message}`);
    }
  }, PING_INTERVAL);
};

module.exports = startKeepAlive;
