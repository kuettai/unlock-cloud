# Architecture TODO: Git + CloudFront/S3 Asset Delivery

## Tasks

- [ ] 1. Create .gitignore (exclude: *.png, *.wav, *.mp3, *.zip, tmp/, node_modules/, test-results/)
- [ ] 2. Initialize git repo, initial commit
- [ ] 3. Create S3 bucket for assets (or reuse existing)
- [ ] 4. Upload all assets to S3 with proper folder structure
- [ ] 5. Create CloudFront distribution pointing to S3
- [ ] 6. Update game engine to load assets from CloudFront URL in production, local path in dev
- [ ] 7. Update deploy process: code → nginx via SSM, assets → S3 directly
- [ ] 8. Test locally (assets from local folder) and production (assets from CloudFront)
- [ ] 9. Update deploy agent and skills with new architecture

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
const ASSET_BASE = location.hostname === 'localhost'
  ? ''  // local: relative path works
  : 'https://dXXXXX.cloudfront.net';  // prod: CDN
```

All `<img src>` and `<audio src>` prefix with ASSET_BASE.

## Current Deploy Process (for reference)
- Code: local → S3 staging → SSM pull to nginx
- S3 staging bucket: kuettai-ap-southeast-1-ssm/unlock-cloud/
- Instance: i-040574f44ac216631 (ap-southeast-1)
