# People Archive

This directory stores the canonical local archive used to migrate CivicActions
team profile data from the public team page.

## Required files

- `metadata.json`: Canonical index of archived team profiles.
- `assets/`: Downloaded headshot images referenced by `metadata.json`.

## Metadata contract

Primary format (`metadata.json`):

- top-level `people_count`
- top-level `people` array
- each person includes at least `name`, `job_title`, `image`, and `team_page_categories`

## Data source

The archive is sourced from:

- Team page: `https://civicactions.com/team/`
- Gatsby static query payload used by the team page

Category labels are normalized to:

- `Leadership`
- `Growth & Strategy`
- `People & Operations`
- `Product & Design`
- `Engineering`
- `Client Services`

A person can appear in more than one category.

## Asset behavior

Images are downloaded into `assets/` and each metadata record stores a relative
`image` path (`assets/<filename>`). `source_image_url` is retained for traceability.
