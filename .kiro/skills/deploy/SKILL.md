---
name: deploy
description: Guide for deploying the Re:Solve app to S3 + CloudFront. Use when pushing updates or redeploying.
---

# Deploy to S3 + CloudFront

## Architecture

- **S3 Bucket:** `kuettai-unlock-asset` (ap-southeast-1) — PRIVATE, no public access
- **CloudFront:** `E2C30I0Z1TIG84` (`d37w3py52wsl8r.cloudfront.net`)
- **Custom Domain:** `beta.re-solve.cloud` (CNAME → CloudFront)
- **ACM Cert:** `arn:aws:acm:us-east-1:956288449190:certificate/6ae2153e-5e68-4c4b-9981-8e32a27f9ea4` (us-east-1)
- **OAI:** EY9ZQ0C4X57N2 (bucket only accessible via CloudFront)
- **URL:** https://beta.re-solve.cloud/app/home.html
- **Root redirect:** `index.html` at bucket root redirects `/` → `/app/home.html` (preserves query params)

## S3 Bucket Structure

```
kuettai-unlock-asset/
├── index.html              ← root redirect (JS-based, preserves ?game_id=)
├── app/                    ← game engine, UI, puzzle components
│   ├── home.html
│   ├── home.js / home.css
│   ├── index.html / index.js / index.css
│   ├── engine.js
│   ├── guide.html
│   ├── puzzle/             ← all lock components
│   └── tools/              ← in-game tools
└── scenarios/              ← all episode data + assets
    ├── categories.json
    ├── aws/
    │   ├── index.json
    │   └── ep0-boot-sequence/ ... ep4-spec-architect/
    └── bible-jesus-miracles/
```

## Deploy Process

### Step 1: Sync app code

```
aws s3 sync app s3://kuettai-unlock-asset/app/ --delete --region ap-southeast-1
```

### Step 2: Sync scenarios (JSON + assets + voice)

```
aws s3 sync scenarios s3://kuettai-unlock-asset/scenarios/ --region ap-southeast-1
```

### Step 3: Invalidate CloudFront cache

```
aws cloudfront create-invalidation --distribution-id E2C30I0Z1TIG84 --paths "/app/*" --region us-east-1
```

For scenario changes only:
```
aws cloudfront create-invalidation --distribution-id E2C30I0Z1TIG84 --paths "/scenarios/*" --region us-east-1
```

### Step 4: Verify

```
curl -s -o /dev/null -w "%{http_code}" https://beta.re-solve.cloud/app/home.html
```

Should return `200`.

## Image Workflow

Before deploying new images:

```
python tools/resize_images.py
```

This resizes all PNGs to optimized sizes (respects portrait/landscape orientation):
- Cover/ending: 576×1024 (portrait) or 1024×576 (landscape)
- Room images: 768×432
- Card images: 320×320

## Voice Workflow

Generate voice files for a scenario:

```
python tools/narrative_to_voice.py scenarios/<category>/<episode>
```

Output: `assets/voice/intro.wav`, `mid_event.wav`, `ending_success.wav`, `ending_failure.wav`

## Quick Deploy (all-in-one)

```
python tools/resize_images.py
aws s3 sync app s3://kuettai-unlock-asset/app/ --delete --region ap-southeast-1
aws s3 sync scenarios s3://kuettai-unlock-asset/scenarios/ --region ap-southeast-1
aws cloudfront create-invalidation --distribution-id E2C30I0Z1TIG84 --paths "/*" --region us-east-1
```

## Security Rules

- **NEVER make the S3 bucket public.** All access goes through CloudFront OAI.
- The bucket policy only allows `s3:GetObject` from CloudFront OAI `EY9ZQ0C4X57N2`.
- ACM certificate must be in `us-east-1` for CloudFront.

## Notes

- No EC2, no ALB, no nginx. Pure static hosting.
- Game engine uses relative paths (`../scenarios/`) which resolve correctly since both `/app/` and `/scenarios/` are on the same origin.
- `ASSET_BASE` in the engine detects production (non-localhost) and uses the CloudFront URL for asset loading.
- Root `index.html` uses JavaScript redirect to preserve `?game_id=` query params.
