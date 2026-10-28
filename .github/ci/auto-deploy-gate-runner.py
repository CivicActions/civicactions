#!/usr/bin/env python3
import os
import sys
import json
import urllib.request
import subprocess

token = os.environ.get('GH_TOKEN', '')
repo = os.environ.get('REPO', '')
live_sha = os.environ.get('LIVE_SHA', '')
master_sha = os.environ.get('MASTER_SHA', '')
dev_sha = os.environ.get('DEV_SHA', '')
test_sha = os.environ.get('TEST_SHA', '')
in_window = os.environ.get('IN_WINDOW', 'false') == 'true'
live_clean = os.environ.get('LIVE_CLEAN', 'false') == 'true'
auto_enabled = os.environ.get('AUTO_DEPLOY_ENABLED_VAR', 'false').lower() == 'true'
track_record = int(os.environ.get('TRACK_RECORD', '0') or 0)

headers = {
    'Authorization': f'token {token}',
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'civicactions-deploy-gate',
}

commits_list = []
if live_sha and master_sha and live_sha != master_sha and token and repo:
    compare_url = f'https://api.github.com/repos/{repo}/compare/{live_sha}...{master_sha}'
    try:
        req = urllib.request.Request(compare_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            comp_data = json.loads(resp.read().decode())
        for c in comp_data.get('commits', []):
            c_sha = c['sha']
            pr_url = f'https://api.github.com/repos/{repo}/commits/{c_sha}/pulls'
            req_p = urllib.request.Request(pr_url, headers={'Authorization': f'token {token}', 'Accept': 'application/vnd.github.groot-preview+json'})
            pr_num = None
            pr_labels = []
            try:
                with urllib.request.urlopen(req_p) as resp_p:
                    prs = json.loads(resp_p.read().decode())
                    if prs:
                        pr_num = prs[0]['number']
                        pr_labels = [l['name'] for l in prs[0].get('labels', [])]
            except Exception:
                pass

            commits_list.append({
                'sha': c_sha,
                'pr': pr_num,
                'labels': pr_labels,
            })
    except Exception as e:
        print(f'Note on commit comparison: {e}', file=sys.stderr)

state = {
    'live_sha': live_sha,
    'master_sha': master_sha,
    'dev_sha': dev_sha,
    'test_sha': test_sha,
    'commits': commits_list,
    'live_clean': live_clean,
    'in_window': in_window,
    'auto_deploy_enabled': auto_enabled,
    'manual_track_record': track_record,
}

with open('gate-state.json', 'w') as f:
    json.dump(state, f, indent=2)

cmd = ['node', '.github/ci/evaluate-deploy-gate.mjs', '--state', json.dumps(state)]
eval_res = subprocess.run(cmd, capture_output=True, text=True, check=True)
eval_data = json.loads(eval_res.stdout)

with open('gate-eval.json', 'w') as f:
    json.dump(eval_data, f, indent=2)

print('Decision:', eval_data['decision'])

gh_out = os.environ.get('GITHUB_OUTPUT')
if gh_out:
    with open(gh_out, 'a') as out:
        out.write(f"decision={eval_data['decision']}\n")
        out.write(f"target_sha={master_sha}\n")

gh_env = os.environ.get('GITHUB_ENV')
if gh_env:
    with open(gh_env, 'a') as env_file:
        env_file.write(f"GATE_JSON<<EOF\n{json.dumps(eval_data)}\nEOF\n")
