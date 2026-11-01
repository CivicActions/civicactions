#!/usr/bin/env node
// Fetches the current Pantheon bot bypass token for the site and exports it as
// PANTHEON_BOT_BYPASS_TOKEN for later steps in the job (masked in logs).
//
// Pantheon's Cloudflare-based Global CDN challenges headless browsers on
// *.pantheonsite.io; Playwright sends this token as x-pantheon-bot-bypass.
// Fetching it each run avoids rotating a stored secret.
//
// Auth: reuses the Terminus session cache when present, otherwise logs in with
// TERMINUS_MACHINE_TOKEN. Nothing is written to disk except GITHUB_ENV.
import { appendFileSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const API = 'https://terminus.pantheon.io';
const site = process.env.PANTHEON_SITE || 'civicactions';

async function call(url, options, what) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`${what} failed: HTTP ${res.status}`);
  }
  return res.json();
}

function cachedSession() {
  try {
    const cache = JSON.parse(readFileSync(join(homedir(), '.terminus', 'cache', 'session'), 'utf8'));
    if (cache.session && Number(cache.expires_at) > Date.now() / 1000 + 300) {
      return cache.session;
    }
  } catch {
    // No usable Terminus session cache.
  }
  return null;
}

async function session() {
  const cached = cachedSession();
  if (cached) {
    return cached;
  }
  const machineToken = process.env.TERMINUS_MACHINE_TOKEN;
  if (!machineToken) {
    throw new Error('No Terminus session cache and TERMINUS_MACHINE_TOKEN is not set');
  }
  const auth = await call(`${API}/api/authorize/machine-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ machine_token: machineToken, client: 'terminus' }),
  }, 'Pantheon machine-token login');
  return auth.session;
}

try {
  const sessionToken = await session();
  const { id: siteId } = await call(`${API}/api/site-names/${encodeURIComponent(site)}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  }, `Pantheon site lookup for ${site}`);
  const bypass = await call(`${API}/bot-bypass/v1/sites/${encodeURIComponent(siteId)}/token`, {
    headers: { Authorization: sessionToken },
  }, 'Pantheon bot bypass token request');
  if (!bypass.token) {
    throw new Error('Pantheon bot bypass response did not include a token');
  }

  if (process.env.GITHUB_ENV) {
    console.log(`::add-mask::${bypass.token}`);
    appendFileSync(process.env.GITHUB_ENV, `PANTHEON_BOT_BYPASS_TOKEN=${bypass.token}\n`);
    console.log(`Exported PANTHEON_BOT_BYPASS_TOKEN (valid until ${bypass.expires_at}).`);
  } else {
    // Local use: print for `export PANTHEON_BOT_BYPASS_TOKEN=$(node ...)`.
    console.log(bypass.token);
  }
} catch (err) {
  console.error(`::error::Could not get Pantheon bot bypass token: ${err.message}`);
  process.exit(1);
}
