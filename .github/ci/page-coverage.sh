#!/usr/bin/env bash
set -euo pipefail

# Check that every node type with published content on dev is covered in pages.yml
# Warns if any bundle is missing (FR-020). Does not fail build.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PAGES_FILE="${SCRIPT_DIR}/../../tests/e2e/pages.yml"

if [[ ! -f "${PAGES_FILE}" ]]; then
  echo "pages.yml not found at ${PAGES_FILE}" >&2
  exit 0
fi

ENV="${1:-dev}"
source "${SCRIPT_DIR}/pantheon.sh"

echo "Querying active published node types on ${ENV}..."
DEV_TYPES_RAW=$(drush "${ENV}" -- php:eval '
$bundles = [];
foreach (\Drupal::entityTypeManager()->getStorage("node_type")->loadMultiple() as $t) {
  $count = \Drupal::entityQuery("node")
    ->accessCheck(FALSE)
    ->condition("type", $t->id())
    ->condition("status", 1)
    ->count()
    ->execute();
  if ($count > 0) {
    $bundles[] = $t->id();
  }
}
echo json_encode($bundles);
' 2>/dev/null || echo "[]")

python3 -c "
import sys, json, re

dev_types = []
try:
    s = sys.argv[1].strip()
    start = s.find('[')
    end = s.rfind(']')
    if start != -1 and end != -1:
        dev_types = json.loads(s[start:end+1])
except Exception as e:
    print(f'Warning: failed to query node types from Drupal: {e}')

with open(sys.argv[2], 'r') as f:
    content = f.read()

# Extract covered node:<type> kinds from pages.yml
covered_types = set(re.findall(r'kind:\s*node:([a-zA-Z0-9_]+)', content))

missing = [t for t in dev_types if t not in covered_types]

if missing:
    print('::warning::The following content types have published nodes on dev but lack test coverage in pages.yml: ' + ', '.join(missing))
else:
    print('All published content types on dev are represented in pages.yml.')
" "${DEV_TYPES_RAW}" "${PAGES_FILE}"
