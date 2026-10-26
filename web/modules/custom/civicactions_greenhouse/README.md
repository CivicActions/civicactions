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
  - Authenticates incoming requests via HTTP Basic Authentication against a Key entity.
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
   - **Secret key**: Enter the exact secret string stored in your Drupal Key entity.
3. Greenhouse will verify the endpoint via a `ping` action, which returns `HTTP 200 OK`.

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

Test the endpoint from your terminal using `curl`:

#### Scenario 1: Ping / Handshake (Expected: 200 OK)
```bash
curl -X POST https://civicactions.ddev.site/api/v1/greenhouse/webhook \
  -u :your_secret_string \
  -H "Content-Type: application/json" \
  -d '{"action": "ping"}'
```

#### Scenario 2: Job Post Event (Expected: 200 OK with Cache Invalidation)
```bash
curl -X POST https://civicactions.ddev.site/api/v1/greenhouse/webhook \
  -u :your_secret_string \
  -H "Content-Type: application/json" \
  -d '{"action": "job_post_updated", "payload": {"id": 123}}'
```

#### Scenario 3: Unauthorized Request (Expected: 403 Forbidden)
```bash
curl -X POST https://civicactions.ddev.site/api/v1/greenhouse/webhook \
  -u :invalid_secret \
  -H "Content-Type: application/json" \
  -d '{"action": "ping"}'
```
