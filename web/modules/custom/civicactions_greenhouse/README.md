# CivicActions Greenhouse

The **CivicActions Greenhouse** module integrates the public Greenhouse Job Board
API to display career opportunities on the CivicActions website. It provides a
custom block with responsive, accessible styling matching the CivicActions design
system, referral attribution tracking (`?gh_src=`), administrative copy
configuration, and an authenticated webhook endpoint for real-time cache
invalidation.

---

## Features

- **Custom Job Listings Block**:
  - Displays published positions fetched from `https://boards-api.greenhouse.io/v1/boards/{board_token}/jobs`.
  - Configurable section heading and introductory disclaimer text.
  - Automatically strips literal trailing `(Remote)` from job titles for consistent display.
  - Formats listings into a responsive card grid with accessible red arrow icons.
  - User-friendly fallback when no jobs are currently open.
- **Referral Attribution (`?gh_src=`)**:
  - Preserves incoming referral query parameter (e.g., `?gh_src=linkedin`) and appends it to all outbound Greenhouse application links (`absolute_url`).
- **High-Performance Caching & Resiliency**:
  - Render cache tag-based invalidation (`civicactions_greenhouse:jobs`).
  - Cache context on `url.query_args:gh_src` ensures pages remain fully cacheable by Dynamic Page Cache and reverse proxies / CDNs (Varnish, Fastly).
  - Enforces a 4-second upstream API timeout to protect PHP worker threads.
  - Graceful fallback serves the last known good cached jobs data during upstream outages.
- **Webhook Integration**:
  - Exposes an endpoint at `/api/v1/greenhouse/webhook`.
  - Authenticates incoming requests by verifying the Greenhouse HMAC SHA-256 `Signature` header against a secret stored in a Key entity.
  - Listens for `ping`, `job_post_created`, `job_post_updated`, and `job_post_deleted` events.
  - Instantly invalidates the `civicactions_greenhouse:jobs` cache tag and proactively re-warms the cache.

---

## Requirements

- **Drupal**: ^10 || ^11
- **Key module** (`key:key`): Used to store and manage the webhook secret key securely.

---

## Installation

Enable the module using Drush:

```bash
ddev drush pm:install civicactions_greenhouse -y
```

Or enable via the Drupal administrative UI at **Extend** (`/admin/modules`).

---

## Configuration & Setup

### 1. Create a Webhook Key Entity

The module uses the Drupal **Key** module to avoid storing raw secrets in configuration.

1. Navigate to **Configuration > System > Keys** (`/admin/config/system/keys`) and click **Add key**.
   - **Key name**: `Greenhouse Webhook Secret`
   - **Key ID**: `greenhouse_webhook_secret`
   - **Key type**: `Authentication`
   - **Key provider**: Choose your preferred provider (e.g. `Easy Encrypted`, `Pantheon`, `File`, or `Configuration`).
   - **Key value**: Enter your shared secret string.
2. Alternatively, create the key via Drush:
   ```bash
   ddev drush key-save greenhouse_webhook_secret "your_secret_string" \
     --label="Greenhouse Webhook Secret" \
     --key-type=authentication \
     --key-provider=config \
     --key-input=text_field -y
   ```

### 2. Configure Greenhouse Settings

1. Navigate to **Configuration > Web services > CivicActions Greenhouse** (`/admin/config/services/greenhouse`).
2. Configure the following fields:
   - **Section Heading**: Title displayed above the listings (default: `Open positions`).
   - **Introductory Text**: Descriptive text or equal opportunity employer disclaimer.
   - **Greenhouse Board Token**: Your Greenhouse board token (default: `civicactions`).
   - **Webhook Key**: Select the Key entity created in step 1 (`greenhouse_webhook_secret`).
3. Click **Save configuration**.

Alternatively, configure via Drush:

```bash
ddev drush config:set civicactions_greenhouse.settings heading "Open positions" -y
ddev drush config:set civicactions_greenhouse.settings board_token "civicactions" -y
ddev drush config:set civicactions_greenhouse.settings webhook_key "greenhouse_webhook_secret" -y
```

### 3. Place the Block

1. Navigate to **Structure > Block layout** (`/admin/structure/block`).
2. Click **Place block** in the desired region (or place within a Drupal Canvas page / Layout Builder).
3. Search for **Greenhouse Job Listings** (`civicactions_greenhouse_jobs`) and place it.
4. Save the block configuration.

---

## Webhook Configuration (Greenhouse)

To enable real-time updates when positions are posted, modified, or removed in Greenhouse:

1. In Greenhouse, navigate to **Configure > Dev Center > Web Hooks > Web Hooks**.
2. Create a new webhook with the following settings:
   - **Name**: `CivicActions Homesite Cache Invalidation`
   - **When**: Select the following actions (create separate webhooks or multi-event if supported):
     - `Job Post Created`
     - `Job Post Updated`
     - `Job Post Deleted`
   - **Endpoint URL**: `https://your-domain.com/api/v1/greenhouse/webhook`
   - **Secret key**: Enter the exact secret string stored in your Drupal Key
     entity. Greenhouse uses it to sign each request body (HMAC SHA-256, sent
     in the `Signature` header). Leading/trailing whitespace in the stored key
     value is ignored, so make sure none is pasted into Greenhouse either.
   - Leave **Advanced settings > Basic authentication** empty. The endpoint
     only accepts signed requests; Basic Auth credentials are ignored.
3. Greenhouse will verify the endpoint via a `ping` action, which returns `HTTP 200 OK`.
   A `403` means the signature did not match: confirm the Greenhouse secret
   equals the key value (`drush key:value-get <key_id>` prints it inside a
   table, so do not copy the table padding).

---

## Drush Commands & Manual Cache Refresh

If you need to manually trigger a jobs refresh without waiting for or relying on a webhook (such as while rotating secrets or testing):

### Dedicated Drush Command

```bash
ddev drush greenhouse:refresh
# or aliases:
ddev drush civicactions:greenhouse-refresh
ddev drush gh-refresh
```

This command:
1. Invalidates the `civicactions_greenhouse:jobs` cache tag across all pages and blocks.
2. Immediately fetches the latest jobs from the Greenhouse Job Board API.
3. Re-warms the cache and prints a formatted summary table of active jobs found.

### One-liner via Drush `php:eval`

```bash
ddev drush ev "\Drupal::service('cache_tags.invalidator')->invalidateTags(['civicactions_greenhouse:jobs']); \$res = \Drupal::service('civicactions_greenhouse.client')->warmCache(); echo 'Refreshed ' . count(\$res['jobs']) . ' jobs.' . PHP_EOL;"
```

### Drush Script (`drush scr`)

You can execute a standalone PHP script with Drush:

```bash
ddev drush scr path/to/script.php
```

Example script contents:
```php
<?php
\Drupal::service('cache_tags.invalidator')->invalidateTags(['civicactions_greenhouse:jobs']);
$result = \Drupal::service('civicactions_greenhouse.client')->warmCache();
echo "Refreshed " . count($result['jobs']) . " jobs from Greenhouse.\n";
```

---

## Testing & Validation

### Automated Unit Tests

Run the test suite inside DDEV using PHPUnit:

```bash
ddev exec phpunit -c web/core web/modules/custom/civicactions_greenhouse
```

### Coding Standards & Static Analysis

```bash
# Check Drupal coding standards
ddev exec vendor/bin/phpcs --standard=Drupal,DrupalPractice web/modules/custom/civicactions_greenhouse

# Run PHPStan static analysis
ddev exec vendor/bin/phpstan analyze web/modules/custom/civicactions_greenhouse
```

### Manual Webhook Verification with cURL

Requests must carry a `Signature: sha256 <digest>` header, where the digest is
the HMAC SHA-256 of the exact request body using the webhook secret. Run these
inside the web container so the signature tools match the server:

```bash
ddev ssh
SECRET='your_secret_string'
URL=http://localhost/api/v1/greenhouse/webhook
sign() { printf '%s' "$1" | openssl dgst -sha256 -hmac "$SECRET" | sed 's/^.*= //'; }
```

#### Scenario 1: Ping / Handshake (Expected: 200 OK)
```bash
BODY='{"action":"ping"}'
curl -X POST "$URL" -H "Content-Type: application/json" \
  -H "Signature: sha256 $(sign "$BODY")" -d "$BODY"
```

#### Scenario 2: Job Post Event (Expected: 200 OK with Cache Invalidation)
```bash
BODY='{"action":"job_post_updated","payload":{"job_post":{"id":123}}}'
curl -X POST "$URL" -H "Content-Type: application/json" \
  -H "Signature: sha256 $(sign "$BODY")" -d "$BODY"
```

#### Scenario 3: Unsigned Request (Expected: 403 Forbidden)
```bash
curl -X POST "$URL" -H "Content-Type: application/json" -d '{"action":"ping"}'
```
