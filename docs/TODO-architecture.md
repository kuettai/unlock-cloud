# Architecture TODO: Git + CloudFront/S3 Asset Delivery

## Tasks

- [x] 1. Create .gitignore (exclude: *.png, *.wav, *.mp3, *.zip, tmp/, node_modules/, test-results/)
- [x] 2. Initialize git repo, initial commit
- [x] 3. Create S3 bucket for assets (kuettai-unlock-asset)
- [x] 4. Upload all assets to S3 with proper folder structure
- [x] 5. Create CloudFront distribution pointing to S3 (d37w3py52wsl8r.cloudfront.net, OAI EY9ZQ0C4X57N2)
- [x] 6. Update game engine to load assets from CloudFront URL in production, local path in dev
- [x] 7. Update deploy process: code → nginx via SSM, assets → S3 directly
- [x] 8. Test locally (assets from local folder) and production (assets from CloudFront)
- [x] 9. Update deploy agent and skills with new architecture

## Architecture

```
Local Dev:  app/ + scenarios/ (with assets/) → localhost:8080
            assets load from local relative paths

Git Repo:   app/ + scenarios/ (WITHOUT assets/) → GitHub
            .gitignore excludes *.png, *.wav, *.mp3

Production: app/ + scenarios/ (code/JSON only) → nginx on EC2 (18.138.232.101)
            assets/ → S3 bucket → CloudFront CDN
            game loads images/audio from CloudFront URL
```

## Key Design

```js
// In index.html
const ASSET_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
  ? SCENARIO_BASE  // local: relative path works
  : 'https://d37w3py52wsl8r.cloudfront.net/' + SCENARIO_BASE.replace(/^\.\.\//, '');  // prod: CDN
```

All `<img src>` and `<audio src>` prefix with ASSET_BASE.

## Current Deploy Process (for reference)
- Code: local → S3 staging → SSM pull to nginx
- S3 staging bucket: kuettai-ap-southeast-1-ssm/unlock-cloud/
- Instance: i-040574f44ac216631 (ap-southeast-1)
