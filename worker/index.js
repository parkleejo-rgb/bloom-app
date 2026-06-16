/**
 * Bloom Push Worker
 * Handles Web Push subscriptions and sends scheduled notifications.
 *
 * Secrets:
 *   VAPID_PRIVATE_JWK - JWK JSON string for the VAPID EC private key
 *   VAPID_SUBJECT     - mailto: or https: contact URI
 *
 * KV binding: SUBS
 * Env vars:
 *   VAPID_PUBLIC_KEY - base64url uncompressed P-256 public key
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    try {
      if (request.method === 'POST') {
        if (url.pathname === '/push/subscribe') return handleSubscribe(request, env);
        if (url.pathname === '/push/unsubscribe') return handleUnsubscribe(request, env);
        if (url.pathname === '/push/update-prefs') return handleUpdatePrefs(request, env);
        if (url.pathname === '/push/test') return handleTest(request, env);
      }
      return json({ ok: true, service: 'Bloom Push Worker' });
    } catch (err) {
      console.error(err);
      return json({ error: 'Internal error' }, 500);
    }
  },

  async scheduled(event, env) {
    await sendScheduledNotifications(env);
  },
};

async function handleSubscribe(request, env) {
  const body = await request.json();
  const { subscription, prefs } = body;
  if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
    return json({ error: 'Invalid subscription' }, 400);
  }

  const key = await subKey(subscription.endpoint);
  await env.SUBS.put(key, JSON.stringify({ subscription, prefs: prefs || {} }));
  return json({ ok: true });
}

async function handleUnsubscribe(request, env) {
  const { endpoint } = await request.json();
  if (!endpoint) return json({ error: 'Missing endpoint' }, 400);

  const key = await subKey(endpoint);
  await env.SUBS.delete(key);
  return json({ ok: true });
}

async function handleUpdatePrefs(request, env) {
  const { endpoint, prefs } = await request.json();
  if (!endpoint) return json({ error: 'Missing endpoint' }, 400);

  const key = await subKey(endpoint);
  const data = await env.SUBS.get(key, 'json');
  if (!data) return json({ error: 'Subscription not found' }, 404);

  data.prefs = { ...(data.prefs || {}), ...(prefs || {}) };
  await env.SUBS.put(key, JSON.stringify(data));
  return json({ ok: true });
}

async function handleTest(request, env) {
  const { endpoint } = await request.json();
  if (!endpoint) return json({ error: 'Missing endpoint' }, 400);

  const key = await subKey(endpoint);
  const data = await env.SUBS.get(key, 'json');
  if (!data?.subscription) return json({ error: 'Subscription not found' }, 404);

  await sendPush(env, data.subscription, {
    title: 'Bloom',
    body: 'Push notifications are connected.',
    tag: 'bloom-test',
    url: './?screen=today',
  });
  return json({ ok: true });
}

async function sendScheduledNotifications(env) {
  const now = new Date();
  let cursor;

  do {
    const page = await env.SUBS.list({ cursor });
    cursor = page.cursor;

    await Promise.allSettled(page.keys.map(async ({ name: key }) => {
      if (key.startsWith('fired_')) return;

      const data = await env.SUBS.get(key, 'json');
      if (!data?.subscription || !data?.prefs) return;

      const { subscription, prefs } = data;
      const local = localTime(now, prefs);
      const notifications = await dueNotifications(env, key, local, prefs);

      for (const notification of notifications) {
        await sendPush(env, subscription, notification).catch(err => {
          if (err?.status === 404 || err?.status === 410) env.SUBS.delete(key);
          else console.error('Push send failed:', err);
        });
      }
    }));
  } while (cursor);
}

function localTime(now, prefs) {
  const tzOffset = typeof prefs.tzOffset === 'number' ? prefs.tzOffset : 0;
  const date = new Date(now.getTime() + tzOffset * 60000);
  return {
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
    day: date.getUTCDay(),
    dateStr: date.toISOString().slice(0, 10),
  };
}

async function dueNotifications(env, key, local, prefs) {
  const notifications = [];
  const state = prefs.state || {};
  const stateIsToday = state.date === local.dateStr;
  const stateIsThisWeek = state.weekStart && state.weekEnd &&
    local.dateStr >= state.weekStart && local.dateStr <= state.weekEnd;

  if (prefs.streakProtection && local.hour === 19) {
    const coreDone = stateIsToday && Number.isFinite(state.coreDone) ? state.coreDone : 0;
    const coreTarget = stateIsToday && Number.isFinite(state.coreTarget) ? state.coreTarget : 5;
    const streakCurrent = Number.isFinite(state.streakCurrent) ? state.streakCurrent : 0;
    const firedKey = `fired_${key}_${local.dateStr}_streak`;
    if (streakCurrent > 0 && coreTarget > 0 && coreDone < coreTarget && !(await env.SUBS.get(firedKey))) {
      notifications.push({
        title: 'Bloom',
        body: "Your streak may need a little attention tonight.",
        tag: 'bloom-streak',
        url: './?screen=today',
      });
      await env.SUBS.put(firedKey, '1', { expirationTtl: 86400 });
    }
  }

  if (prefs.weighIn && local.day === 0 && local.hour === 9) {
    const firedKey = `fired_${key}_${local.dateStr}_weighin`;
    if (!(stateIsThisWeek && state.weighInThisWeek) && !(await env.SUBS.get(firedKey))) {
      notifications.push({
        title: 'Bloom',
        body: "Weekly weigh-in -- log it while you're thinking about it.",
        tag: 'bloom-weighin',
        url: './?screen=progress',
      });
      await env.SUBS.put(firedKey, '1', { expirationTtl: 86400 });
    }
  }

  if (prefs.bedtime && local.hour === 22) {
    const firedKey = `fired_${key}_${local.dateStr}_bedtime`;
    if (!(stateIsToday && state.sleepBedChecked) && !(await env.SUBS.get(firedKey))) {
      notifications.push({
        title: 'Bloom',
        body: 'Bedtime habit -- 30 minutes to your target.',
        tag: 'bloom-bedtime',
        url: './?screen=today',
      });
      await env.SUBS.put(firedKey, '1', { expirationTtl: 86400 });
    }
  }

  if (prefs.morningCheckin && prefs.morningTime) {
    const [targetHour, targetMinute] = prefs.morningTime.split(':').map(Number);
    const target = targetHour * 60 + (Number.isFinite(targetMinute) ? targetMinute : 0);
    const current = local.hour * 60 + local.minute;
    if (Number.isFinite(targetHour) && current >= target && current < target + 30) {
      const firedKey = `fired_${key}_${local.dateStr}_morning`;
      if (!(await env.SUBS.get(firedKey))) {
        notifications.push({
          title: 'Bloom',
          body: "How's your morning going? Log your habits.",
          tag: 'bloom-morning',
          url: './?screen=today',
        });
        await env.SUBS.put(firedKey, '1', { expirationTtl: 86400 });
      }
    }
  }

  return notifications;
}

async function sendPush(env, subscription, payload) {
  const encrypted = await encryptPayload(subscription, JSON.stringify(payload));
  const vapidHeader = await createVapidHeader(env, subscription.endpoint);

  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization': vapidHeader,
      'TTL': '86400',
      'Urgency': 'normal',
    },
    body: encrypted,
  });

  if (!response.ok && response.status !== 201) {
    const err = new Error(`Push failed: ${response.status}`);
    err.status = response.status;
    throw err;
  }
}

async function createVapidHeader(env, endpoint) {
  const privateJwk = JSON.parse(env.VAPID_PRIVATE_JWK);
  const publicKeyB64 = env.VAPID_PUBLIC_KEY;
  const subject = env.VAPID_SUBJECT || 'mailto:admin@example.com';
  const audience = new URL(endpoint).origin;
  const exp = Math.floor(Date.now() / 1000) + 43200;

  const header = b64url(te(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const payload = b64url(te(JSON.stringify({ aud: audience, exp, sub: subject })));
  const input = `${header}.${payload}`;

  const key = await crypto.subtle.importKey(
    'jwk',
    privateJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  const sig = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, te(input))
  );

  return `vapid t=${input}.${b64url(sig)},k=${publicKeyB64}`;
}

async function encryptPayload(subscription, payloadStr) {
  const plaintext = te(payloadStr);
  const p256dh = b64d(subscription.keys.p256dh);
  const authSecret = b64d(subscription.keys.auth);

  const serverKP = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  );
  const serverPubRaw = new Uint8Array(await crypto.subtle.exportKey('raw', serverKP.publicKey));

  const clientPub = await crypto.subtle.importKey(
    'raw',
    p256dh,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  );
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: clientPub }, serverKP.privateKey, 256)
  );

  const keyInfo = cat(te('WebPush: info\0'), p256dh, serverPubRaw);
  const ikm = await hkdf(sharedSecret, authSecret, keyInfo, 32);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(ikm, salt, te('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(ikm, salt, te('Content-Encoding: nonce\0'), 12);

  const padded = cat(plaintext, new Uint8Array([0x02]));
  const cekKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce, tagLength: 128 }, cekKey, padded)
  );

  const header = new Uint8Array(16 + 4 + 1 + serverPubRaw.length);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096, false);
  header[20] = serverPubRaw.length;
  header.set(serverPubRaw, 21);

  return cat(header, ciphertext);
}

function te(s) { return new TextEncoder().encode(s); }

function b64url(buf) {
  let s = '';
  for (const b of buf instanceof Uint8Array ? buf : new Uint8Array(buf)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function b64d(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  const raw = atob(str);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function cat(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) {
    out.set(a, off);
    off += a.length;
  }
  return out;
}

async function hkdf(ikm, salt, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8)
  );
}

async function subKey(endpoint) {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', te(endpoint)));
  return Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
}
