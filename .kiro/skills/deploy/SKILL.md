---
name: deploy
description: Guide for deploying the Unlock the Cloud app to the EC2 instance. Use when pushing updates or redeploying.
---

# Deploy to EC2

## Current Environment

- **Instance:** i-040574f44ac216631 (t3.micro, Amazon Linux 2023)
- **Region:** ap-southeast-1
- **IP:** 18.138.232.101
- **URL:** http://18.138.232.101/app/index.html
- **S3 Staging:** s3://kuettai-ap-southeast-1-ssm/unlock-cloud/
- **Web server:** nginx, files served from /usr/share/nginx/html/
- **Access:** AWS Systems Manager (SSM) — no SSH, port 22 is closed

## Deploy Process (SSM + S3)

### Step 1: Sync local files to S3 staging

```
aws s3 sync app s3://kuettai-ap-southeast-1-ssm/unlock-cloud/app/ --delete --region ap-southeast-1
aws s3 sync scenarios s3://kuettai-ap-southeast-1-ssm/unlock-cloud/scenarios/ --delete --region ap-southeast-1
```

### Step 2: Pull from S3 to nginx via SSM

```
aws ssm send-command --document-name "AWS-RunShellScript" --instance-ids "i-040574f44ac216631" --parameters commands='["aws s3 sync s3://kuettai-ap-southeast-1-ssm/unlock-cloud/app/ /usr/share/nginx/html/app/ --delete --region ap-southeast-1 && aws s3 sync s3://kuettai-ap-southeast-1-ssm/unlock-cloud/scenarios/ /usr/share/nginx/html/scenarios/ --delete --region ap-southeast-1 && chmod -R 755 /usr/share/nginx/html/app /usr/share/nginx/html/scenarios"]' --region ap-southeast-1
```

### Step 3: Check command status

```
aws ssm get-command-invocation --command-id "<COMMAND_ID>" --instance-id "i-040574f44ac216631" --region ap-southeast-1
```

Wait for `"Status": "Success"`.

### Step 4: Verify

- Home page: http://18.138.232.101/app/home.html
- Check new/changed episodes load correctly

## Run Commands via SSM

To run any command on the instance (replaces SSH):

```
aws ssm send-command --document-name "AWS-RunShellScript" --instance-ids "i-040574f44ac216631" --parameters commands='["<COMMAND>"]' --region ap-southeast-1
```

Note: On Windows PowerShell, use double quotes for the outer string and escape inner quotes, or use a JSON file for parameters.

## Notes

- Port 22 (SSH) is disabled. All access is via SSM.
- The .pem key file is no longer needed for deployment.
- nginx serves static files only — no backend.
- App loads scenarios from ../scenarios/<category>/<episode>/ relative to app/index.html.
- Home page loads categories from ../scenarios/categories.json, then episodes from ../scenarios/<category>/index.json.
- S3 staging bucket: `kuettai-ap-southeast-1-ssm` prefix `unlock-cloud/`
- Instance IAM role `EpoxyChronicleInstanceRole` has read access to the S3 staging path.
