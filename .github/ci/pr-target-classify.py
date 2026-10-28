#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import urllib.parse
import subprocess

token = os.environ.get('GH_TOKEN', '')
repo = os.environ.get('REPO', '')
pr = os.environ.get('PR_NUMBER', '')
base_sha = os.environ.get('BASE_SHA', '')
head_sha = os.environ.get('HEAD_SHA', '')
ecosystem = os.environ.get('PACKAGE_ECOSYSTEM', 'composer')
auto_merge_enabled = os.environ.get('AUTO_MERGE_ENABLED', 'false').lower() == 'true'

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'civicactions-classifier',
}

# 1. Fetch changed files on PR
files_url = f'https://api.github.com/repos/{repo}/pulls/{pr}/files?per_page=100'
req = urllib.request.Request(files_url, headers=headers)
with urllib.request.urlopen(req) as resp:
    pr_files = [f['filename'] for f in json.loads(resp.read().decode())]

with open('changed-files.json', 'w') as f:
    json.dump(pr_files, f)

# 2. Fetch lockfiles
lock_filename = 'composer.lock' if ecosystem == 'composer' else 'web/themes/omnichannel/package-lock.json'
def fetch_file(path, ref):
    url = f'https://api.github.com/repos/{repo}/contents/{path}?ref={ref}'
    try:
        r = urllib.request.Request(url, headers={'Authorization': f'token {token}', 'Accept': 'application/vnd.github.raw+json'})
        with urllib.request.urlopen(r) as response:
            return response.read().decode('utf-8')
    except Exception:
        return '{}'

base_lock = fetch_file(lock_filename, base_sha)
head_lock = fetch_file(lock_filename, head_sha)

with open('base-lock.json', 'w') as f:
    f.write(base_lock)
with open('head-lock.json', 'w') as f:
    f.write(head_lock)

metadata = {
    'advisories': []
}
alerts_lookup = os.environ.get('ALERTS_LOOKUP', '')
if alerts_lookup and alerts_lookup != '[]':
    try:
        metadata['advisories'] = json.loads(alerts_lookup)
    except Exception:
        metadata['advisories'] = [{'ghsa_id': 'advisory'}]

with open('metadata.json', 'w') as f:
    json.dump(metadata, f)

# 3. Execute classify-dependency-pr.mjs
cmd = [
    'node', '.github/ci/classify-dependency-pr.mjs',
    '--metadata', 'metadata.json',
    '--base-lock', 'base-lock.json',
    '--head-lock', 'head-lock.json',
    '--files', 'changed-files.json',
    '--ecosystem', ecosystem,
]
res = subprocess.run(cmd, capture_output=True, text=True, check=True)
result = json.loads(res.stdout)

category = result['category']
label = result['label']
reasons = result.get('reasons', [])

print(f'Classification result for PR #{pr}: {category} -> {label}')

# 4. Set labels
existing_labels_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
req_l = urllib.request.Request(existing_labels_url, headers=headers)
with urllib.request.urlopen(req_l) as resp_l:
    cur_labels = [l['name'] for l in json.loads(resp_l.read().decode())]

for l in cur_labels:
    if l.startswith('deps:') and l != label:
        del_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels/{urllib.parse.quote(l)}'
        urllib.request.urlopen(urllib.request.Request(del_url, headers=headers, method='DELETE'))

add_label_url = f'https://api.github.com/repos/{repo}/issues/{pr}/labels'
urllib.request.urlopen(urllib.request.Request(add_label_url, data=json.dumps({'labels': [label]}).encode('utf-8'), headers=headers))

# 5. Build PR comment
diff_rows = ''
for d in result.get('diffs', []):
    diff_rows += f"| `{d['name']}` | {d.get('from') or 'new'} | {d.get('to') or 'removed'} | {d['change']} |\n"

comment_lines = [
    f"### Dependabot Classification: `{label}`",
    f"- **Category**: **{category}**",
    f"- **Ecosystem**: {ecosystem}",
    f"- **Security Advisories**: {len(result.get('advisories', []))}",
    "",
    "| Package | From | To | Change |",
    "|---|---|---|---|",
    diff_rows.strip() if diff_rows else "| None | - | - | - |",
]
if reasons:
    comment_lines.append("\n**Reasons for review:**")
    for r in reasons:
        comment_lines.append(f"- {r}")

comment_body = "\n".join(comment_lines)

with open('classification-comment.md', 'w') as f:
    f.write(comment_body)

gh_env = os.environ.get('GITHUB_ENV')
if gh_env:
    with open(gh_env, 'a') as env_file:
        env_file.write(f"COMMENT_BODY<<EOF\n{comment_body}\nEOF\n")

# 6. Auto-merge if eligible
if auto_merge_enabled and category != 'needs-review':
    print('Enabling auto-merge for PR #' + pr)
    subprocess.run(['gh', 'pr', 'merge', pr, '--auto', '--squash'], check=False)
