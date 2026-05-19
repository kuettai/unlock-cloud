---
name: workshop-download
description: Guide for downloading en-US content from AWS Workshop Studio (catalog.workshops.aws). Use when extracting workshop markdown content for reference or analysis.
---

# Download Workshop Content

## How It Works

AWS Workshop Studio serves content from a static CDN. Each workshop has:
- A **catalog ID** (visible in the URL, e.g. `119307ce-4c43-4e96-887c-cd8454b3d229`)
- A **static content ID** (different UUID used in the CDN URL)

Content lives at:
```
https://static.us-east-1.prod.workshops.aws/public/{staticContentId}/content/**/*.en.md
```

## Finding the Static Content ID

The static content ID is NOT the same as the catalog ID. To find it:
1. Open the workshop in a browser: `https://catalog.workshops.aws/workshops/{catalogId}/en-US`
2. Open DevTools → Network tab
3. Look for requests to `static.us-east-1.prod.workshops.aws/public/{uuid}/`
4. The UUID in that path is the static content ID

## Download Process

### Step 1: Fetch the manifest

```
https://static.us-east-1.prod.workshops.aws/public/{staticContentId}/manifest.json
```

Save it locally (e.g. `manifest.json`).

### Step 2: Run the download script

Create and run a Node.js script:

```javascript
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://static.us-east-1.prod.workshops.aws/public/{staticContentId}';
const OUT_DIR = path.join(__dirname, 'workshop-content');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

function collectResources(node, list = []) {
  if (node.resource) list.push(node.resource);
  if (node.navigation) node.navigation.forEach(child => collectResources(child, list));
  return list;
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`${res.statusCode} for ${url}`));
      const ws = fs.createWriteStream(dest);
      res.pipe(ws);
      ws.on('finish', () => { ws.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  const resources = new Set();
  collectResources(manifest.content['en-US'], []).forEach(r => resources.add(r));

  console.log(`Found ${resources.size} pages to download`);
  let done = 0;
  for (const resource of resources) {
    const url = `${BASE_URL}${resource}`;
    const dest = path.join(OUT_DIR, resource);
    try {
      await download(url, dest);
      done++;
      console.log(`[${done}/${resources.size}] ${resource}`);
    } catch (e) {
      console.error(`FAILED: ${resource} - ${e.message}`);
    }
  }
  console.log(`Done. ${done}/${resources.size} downloaded to ${OUT_DIR}`);
}

main();
```

## Key Notes

- Only download `en-US` locale — filter via `manifest.content['en-US']`
- The manifest contains a tree structure with `navigation` arrays and `resource` paths
- All resource paths are relative (e.g. `/content/0100-introduction/index.en.md`)
- Files are markdown with Workshop Studio-specific shortcodes/formatting

## Known Static Content IDs

| Workshop | Catalog ID | Static Content ID |
|----------|-----------|-------------------|
| Advanced Development with Kiro CLI | `54c3335f-633f-4d47-a215-6d5694e18f7a` | `56681eba-a09f-44ed-8410-0973014f3f5c` |
| A Complete Guide to Amazon Quick Suite | `119307ce-4c43-4e96-887c-cd8454b3d229` | `86fee6db-532b-4ba3-b519-414f409bbd74` |
