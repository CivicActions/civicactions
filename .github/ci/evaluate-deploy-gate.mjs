/**
 * Evaluates whether an automated live deployment of pending security updates is safe.
 * Zero external dependencies.
 */

export function evaluateDeployGate(state) {
  const reasons = [];

  const {
    live_sha,
    master_sha,
    dev_sha,
    test_sha,
    commits = [],
    live_clean = false,
    in_window = false,
    auto_deploy_enabled = false,
    manual_track_record = 0,
  } = state;

  // 1. Kill switch
  if (!auto_deploy_enabled) {
    reasons.push('Auto-deployment kill switch is OFF (vars.AUTO_DEPLOY_ENABLED != true)');
  }

  // 2. Deployment window
  if (!in_window) {
    reasons.push('Current time is outside the allowed deployment window or is a holiday');
  }

  // 3. Track record
  if (manual_track_record < 5) {
    reasons.push(`Manual deployment track record (${manual_track_record}) is below the required 5 successful deploys`);
  }

  // 4. Dev must be at master head
  const devMatches = dev_sha && (master_sha.startsWith(dev_sha) || dev_sha.startsWith(master_sha));
  if (!devMatches) {
    reasons.push(`Dev environment (${dev_sha ? dev_sha.slice(0, 7) : 'none'}) is not on master head (${master_sha.slice(0, 7)})`);
  }

  // 5. Test environment must not be ahead of live with unknown/unapproved commits
  const eligibleShas = new Set([live_sha, ...commits.map((c) => c.sha)]);
  const testNotAhead = eligibleShas.has(test_sha) || commits.some((c) => c.sha.startsWith(test_sha) || test_sha.startsWith(c.sha));
  if (!testNotAhead) {
    reasons.push(`Test environment (${test_sha ? test_sha.slice(0, 7) : 'unknown'}) is ahead of live with unverified commits`);
  }

  // 6. Live environment must have zero drift and zero pending updates
  if (!live_clean) {
    reasons.push('Live environment has configuration drift or pending database updates');
  }

  // 7. Verify all pending commits between live and master are verified security updates
  if (commits.length === 0) {
    reasons.push('No pending commits between live and master to deploy');
  } else {
    for (const commit of commits) {
      const isSecurityVerified = (commit.labels || []).includes('deps:security-verified');
      if (!commit.pr) {
        reasons.push(`Commit ${commit.sha.slice(0, 7)} has no associated PR (direct push or untracked)`);
      } else if (!isSecurityVerified) {
        reasons.push(`Commit ${commit.sha.slice(0, 7)} (PR #${commit.pr}) is not a verified security update`);
      }
    }
  }

  const decision = reasons.length === 0 ? 'deploy' : 'blocked';

  return {
    decision,
    reasons,
    conditions: {
      auto_deploy_enabled,
      in_window,
      manual_track_record_met: manual_track_record >= 5,
      dev_at_master: !!devMatches,
      test_not_ahead: !!testNotAhead,
      live_clean,
      all_commits_security_verified: commits.length > 0 && commits.every((c) => (c.labels || []).includes('deps:security-verified') && c.pr),
    },
    commits_count: commits.length,
  };
}

if (process.argv[1] && process.argv[1].endsWith('evaluate-deploy-gate.mjs')) {
  let stateJson = '{}';
  for (let i = 2; i < process.argv.length; i++) {
    if (process.argv[i] === '--state') stateJson = process.argv[++i];
  }
  const state = JSON.parse(stateJson);
  const result = evaluateDeployGate(state);
  console.log(JSON.stringify(result, null, 2));
}
