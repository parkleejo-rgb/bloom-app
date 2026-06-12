/**
 * Run once to generate VAPID keys:
 *   node worker/generate-keys.mjs
 *
 * Then:
 *   1. Copy VAPID_PUBLIC_KEY into app.js and worker/wrangler.toml.
 *   2. Run: wrangler secret put VAPID_PRIVATE_JWK
 *      and paste the VAPID_PRIVATE_JWK value when prompted.
 *   3. Run: wrangler secret put VAPID_SUBJECT
 *      and use a mailto: or https: contact URI.
 */

import { webcrypto } from 'node:crypto';

const { subtle } = webcrypto;

const keyPair = await subtle.generateKey(
  { name: 'ECDSA', namedCurve: 'P-256' },
  true,
  ['sign', 'verify']
);

const privateJwk = await subtle.exportKey('jwk', keyPair.privateKey);
const publicRaw = new Uint8Array(await subtle.exportKey('raw', keyPair.publicKey));

function b64url(buf) {
  return Buffer.from(buf).toString('base64url');
}

console.log('\n=== Bloom VAPID Keys ===\n');
console.log('VAPID_PUBLIC_KEY (paste into app.js and worker/wrangler.toml):');
console.log(b64url(publicRaw));
console.log('\nVAPID_PRIVATE_JWK (run: wrangler secret put VAPID_PRIVATE_JWK):');
console.log(JSON.stringify(privateJwk));
console.log('\nVAPID_SUBJECT (run: wrangler secret put VAPID_SUBJECT):');
console.log('mailto:admin@example.com');
