#!/usr/bin/env python3
import os
import sys
import json
import urllib.request

token = os.environ.get('GH_TOKEN', '')
repo = os.environ.get('REPO', '')
composer_raw = os.environ.get('COMPOSER_AUDIT_RAW', '{}')
drush_raw = os.environ.get('PM_SECURITY_RAW', '{}')

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'civicactions-security-audit',
}

# Fetch open Dependabot PR titles
open_pr_titles = []
if token and repo:
    pr_url = f'https://api.github.com/repos/{repo}/pulls?state=open&creator=app%2Fdependabot&per_page=100'
    req = urllib.request.Request(pr_url, headers=headers)
    try:
        with urllib.request.urlopen(req) as resp:
            open_pr_titles = [pr['title'].lower() for pr in json.loads(resp.read().decode())]
    except Exception:
        pass

findings = []

# Check composer audit
try:
    comp_data = json.loads(composer_raw)
    for pkg, advisories in comp_data.get('advisories', {}).items():
        if not any(pkg.lower() in title for title in open_pr_titles):
            for adv in advisories:
                findings.append({
                    'source': 'composer audit',
                    'package': pkg,
                    'title': adv.get('title', 'Security advisory'),
                    'cve': adv.get('cve', ''),
                    'link': adv.get('link', ''),
                })
except Exception:
    pass

# Check drush pm:security
try:
    pm_data = json.loads(drush_raw)
    if isinstance(pm_data, dict):
        for mod, info in pm_data.items():
            if not any(mod.lower() in title for title in open_pr_titles):
                findings.append({
                    'source': 'drush pm:security',
                    'package': mod,
                    'title': info.get('title', 'Drupal project security update required'),
                    'link': info.get('link', ''),
                })
except Exception:
    pass

has_uncovered_findings = len(findings) > 0
print(f'Uncovered security findings: {len(findings)}')

gh_out = os.environ.get('GITHUB_OUTPUT')
if gh_out:
    with open(gh_out, 'a') as out:
        out.write(f'has_findings={"true" if has_uncovered_findings else "false"}\n')

if has_uncovered_findings:
    lines = ['The following security advisories affect dependencies on `master` or `live` and have NO open fix PR:\n']
    lines.append('| Source | Package | Advisory | Link |')
    lines.append('|---|---|---|---|')
    for f in findings:
        lines.append(f"| {f['source']} | `{f['package']}` | {f['title']} | {f.get('link', '')} |")
    report = '\n'.join(lines)
    with open('security-report.md', 'w') as rf:
        rf.write(report)
    gh_env = os.environ.get('GITHUB_ENV')
    if gh_env:
        with open(gh_env, 'a') as env_file:
            env_file.write(f"REPORT_BODY<<EOF\n{report}\nEOF\n")
