// Uploads a side-by-side image (dev reference | review environment | diff) for
// each failed visual comparison as its own unzipped artifact, so the PR comment
// can link straight to it. Writes a "<pageId>:<project>" -> URL map as JSON.
//
// Must run inside a JavaScript action (actions/github-script): artifact uploads
// need ACTIONS_RUNTIME_TOKEN, which plain `run:` steps don't receive.
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { parseVisualResults } from '../../tests/e2e/lib/visual-summary.mjs';

const GAP = 24;
const GAP_COLOR = 0xcc;

/**
 * Places PNG images side by side, top-aligned on a white background with grey
 * gaps between them. Returns the encoded PNG.
 */
export function composeSideBySide(buffers) {
  const images = buffers.map((buffer) => PNG.sync.read(buffer));
  const width = images.reduce((sum, image) => sum + image.width, 0) + GAP * (images.length - 1);
  const height = Math.max(...images.map((image) => image.height));
  const out = new PNG({ width, height });
  out.data.fill(255);

  let x = 0;
  images.forEach((image, index) => {
    PNG.bitblt(image, out, 0, 0, image.width, image.height, x, 0);
    x += image.width;
    if (index < images.length - 1) {
      for (let y = 0; y < height; y++) {
        const start = (y * width + x) * 4;
        for (let i = start; i < start + GAP * 4; i += 4) {
          out.data[i] = out.data[i + 1] = out.data[i + 2] = GAP_COLOR;
        }
      }
      x += GAP;
    }
  });
  return PNG.sync.write(out);
}

export async function run() {
  const resultsDir = process.env.RESULTS_DIR || 'tests/e2e/test-results';
  const outFile = process.env.LINKS_FILE || 'vrt-links.json';
  const prefix = `vrt-pr${process.env.PR_NUMBER || 'x'}-attempt${process.env.GITHUB_RUN_ATTEMPT || '1'}`;
  const runUrl = `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`;
  const workDir = fs.mkdtempSync(path.join(process.env.RUNNER_TEMP || '/tmp', 'vrt-'));

  const { DefaultArtifactClient } = await import('@actions/artifact');
  const client = new DefaultArtifactClient();
  const links = {};

  const items = parseVisualResults(path.join(resultsDir, 'results.json')).filter((item) => item.images);
  for (const item of items) {
    const key = `${item.pageId}:${item.project}`;
    try {
      const sources = [item.images.expected, item.images.actual, item.images.diff]
        .map((file) => fs.readFileSync(path.join(resultsDir, file)));
      const file = path.join(workDir, `${prefix}-${item.project}-${item.pageId}.png`);
      fs.writeFileSync(file, composeSideBySide(sources));
      const { id } = await client.uploadArtifact(path.basename(file), [file], workDir, {
        skipArchive: true,
        retentionDays: 14,
      });
      links[key] = `${runUrl}/artifacts/${id}`;
      console.log(`Uploaded ${key}: ${links[key]}`);
    } catch (err) {
      console.log(`::warning::Could not upload difference image for ${key}: ${err.message}`);
    }
  }

  fs.writeFileSync(outFile, JSON.stringify(links, null, 2));
  console.log(`Uploaded ${Object.keys(links).length} of ${items.length} difference images.`);
}
