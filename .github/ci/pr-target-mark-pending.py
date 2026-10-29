#!/usr/bin/env python3
import os
import sys
import json
import urllib.request

token = os.environ.get('GH_TOKEN', '')
repo = os.environ.get('REPO', '')
sha = os.environ.get('HEAD_SHA', '')
pr = os.environ.get('PR_NUMBER', '')

if not (token and repo and sha and pr):
    print("Missing required environment variables", file=sys.stderr)
    sys.exit(0)

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'civicactions-pr-target',
}

# 1. Post pending status for ci/static
post_url = f'https://api.github.com/repos/{repo}/statuses/{sha}'
req = urllib.request.Request(
    post_url,
    data=json.dumps({
        'state': 'pending',
        'context': 'ci/static',
        'description': 'Static checks running',
    }).encode('utf-8'),
    headers=headers,
)
urllib.request.urlopen(req)

# 2. Post pending status for ci/review-env
req2 = urllib.request.Request(
    post_url,
    data=json.dumps({
        'state': 'pending',
        'context': 'ci/review-env',
        'description': f'Waiting for Pantheon pr-{pr}',
    }).encode('utf-8'),
    headers=headers,
)
urllib.request.urlopen(req2)
print(f'Initialized pending statuses for {sha[:8]} on PR #{pr}')

# 3. Cancel in-flight pr-review-env runs for older SHAs on this PR
runs_url = f'https://api.github.com/repos/{repo}/actions/workflows/pr-review-env.yml/runs?status=in_progress'
try:
    req_runs = urllib.request.Request(runs_url, headers=headers)
    with urllib.request.urlopen(req_runs) as resp:
        runs_data = json.loads(resp.read().decode()).get('workflow_runs', [])

    target_prefix = f'review-env PR #{pr} @'
    for r in runs_data:
        run_name = r.get('name', '')
        run_id = r['id']
        if target_prefix in run_name and not run_name.endswith(sha[:8]):
            print(f'Cancelling stale in-progress review-env run #{run_id}: {run_name}')
            cancel_url = f'https://api.github.com/repos/{repo}/actions/runs/{run_id}/cancel'
            urllib.request.urlopen(urllib.request.Request(cancel_url, data=b'', headers=headers))
except Exception as e:
    print(f'Note on run cancellation: {e}')
