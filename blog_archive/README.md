# Blog Archive

This directory stores the canonical local archive used to migrate CivicActions
blog posts into Drupal Article content.

## Required files

- `metadata.json`: Canonical index of all archived articles.
- One HTML file per article, referenced by `file` in `metadata.json`.
- `assets/`: Image assets referenced by article HTML in `posts/`.
- `run_throttled_import.sh`: Helper for chunked migration imports.

## Metadata contract

Primary format (`metadata.json`):

- top-level `post_count`
- top-level `posts` array
- each post includes at least `id`, `title`, `published_at`, and `file`

## Migration behavior

The custom migration source plugin reads `metadata.json` and processes
`posts[].file` entries.

During source parsing, it rewrites relative image references and copies
matching files from
`blog_archive/assets/` into `public://blog_archive_assets/` so migrated article
body content includes working local image URLs.

This workflow is fully local and does not fetch article content from Medium.

## Import throttling

Use chunked imports when needed:

```bash
ddev drush migrate:import civicactions_medium_articles --limit=10
# wait 10-30 seconds
ddev drush migrate:import civicactions_medium_articles --limit=10
```

Or use the helper script for repeated chunked imports:

```bash
chmod +x blog_archive/run_throttled_import.sh
BATCH_SIZE=10 SLEEP_SECONDS=20 MAX_LOOPS=50 \
	blog_archive/run_throttled_import.sh civicactions_medium_articles
```
