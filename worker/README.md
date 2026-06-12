# Bloom Push Worker

Cloudflare Worker for scheduled Web Push notifications.

## Setup

1. Generate VAPID keys:

   ```sh
   node worker/generate-keys.mjs
   ```

2. Paste the generated `VAPID_PUBLIC_KEY` into:

   - `app.js`
   - `worker/wrangler.toml`

3. Create the KV namespace and paste its id into `worker/wrangler.toml`:

   ```sh
   wrangler kv namespace create SUBS
   ```

4. Store the private VAPID values as Worker secrets:

   ```sh
   wrangler secret put VAPID_PRIVATE_JWK
   wrangler secret put VAPID_SUBJECT
   ```

5. Deploy:

   ```sh
   wrangler deploy --config worker/wrangler.toml
   ```

6. Paste the deployed Worker URL into `PUSH_WORKER_URL` in `app.js`.

After deployment, the Settings notification test button uses `/push/test` so you can confirm the server path works.
