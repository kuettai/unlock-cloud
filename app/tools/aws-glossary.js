/**
 * AWS Service Glossary Tool
 *
 * Searchable quick-reference of AWS services.
 *
 * Usage:
 *   new AwsGlossary(containerEl);
 */

const AWS_SERVICES = [
  { name: 'EC2', full: 'Elastic Compute Cloud', desc: 'Virtual servers in the cloud' },
  { name: 'S3', full: 'Simple Storage Service', desc: 'Object storage for any data' },
  { name: 'RDS', full: 'Relational Database Service', desc: 'Managed relational databases' },
  { name: 'Lambda', full: 'AWS Lambda', desc: 'Run code without servers' },
  { name: 'VPC', full: 'Virtual Private Cloud', desc: 'Isolated network in the cloud' },
  { name: 'IAM', full: 'Identity and Access Management', desc: 'Control who can do what' },
  { name: 'CloudFront', full: 'Amazon CloudFront', desc: 'Global content delivery network' },
  { name: 'Route 53', full: 'Amazon Route 53', desc: 'DNS and domain registration' },
  { name: 'DynamoDB', full: 'Amazon DynamoDB', desc: 'NoSQL key-value database' },
  { name: 'SQS', full: 'Simple Queue Service', desc: 'Message queuing service' },
  { name: 'SNS', full: 'Simple Notification Service', desc: 'Pub/sub messaging and notifications' },
  { name: 'ECS', full: 'Elastic Container Service', desc: 'Run Docker containers' },
  { name: 'EKS', full: 'Elastic Kubernetes Service', desc: 'Managed Kubernetes' },
  { name: 'CloudWatch', full: 'Amazon CloudWatch', desc: 'Monitoring and observability' },
  { name: 'CloudTrail', full: 'AWS CloudTrail', desc: 'API activity logging and audit' },
  { name: 'KMS', full: 'Key Management Service', desc: 'Create and manage encryption keys' },
  { name: 'Secrets Manager', full: 'AWS Secrets Manager', desc: 'Store and rotate secrets' },
  { name: 'WAF', full: 'Web Application Firewall', desc: 'Filter malicious web traffic' },
  { name: 'GuardDuty', full: 'Amazon GuardDuty', desc: 'Threat detection service' },
  { name: 'ALB', full: 'Application Load Balancer', desc: 'Distribute traffic across targets' },
  { name: 'Auto Scaling', full: 'AWS Auto Scaling', desc: 'Scale resources automatically' },
  { name: 'CloudFormation', full: 'AWS CloudFormation', desc: 'Infrastructure as code' },
  { name: 'Elastic Beanstalk', full: 'AWS Elastic Beanstalk', desc: 'Deploy and manage apps easily' },
  { name: 'Step Functions', full: 'AWS Step Functions', desc: 'Orchestrate serverless workflows' },
  { name: 'API Gateway', full: 'Amazon API Gateway', desc: 'Create and manage APIs' },
  { name: 'Glacier', full: 'S3 Glacier', desc: 'Low-cost archive storage' },
  { name: 'EBS', full: 'Elastic Block Store', desc: 'Block storage for EC2' },
  { name: 'EFS', full: 'Elastic File System', desc: 'Shared file storage for EC2' },
  { name: 'Kinesis', full: 'Amazon Kinesis', desc: 'Real-time streaming data' },
  { name: 'Redshift', full: 'Amazon Redshift', desc: 'Data warehouse' },
  { name: 'Athena', full: 'Amazon Athena', desc: 'Query S3 data with SQL' },
  { name: 'Cost Explorer', full: 'AWS Cost Explorer', desc: 'Visualize and manage costs' },
];

class AwsGlossary {
  constructor(container, opts = {}) {
    this.container = container;
    this._render();
  }

  _render() {
    this.container.innerHTML = '';
    const wrap = document.createElement('div');
    wrap.className = 'awsg';

    this.searchInput = document.createElement('input');
    this.searchInput.className = 'awsg-search';
    this.searchInput.type = 'text';
    this.searchInput.placeholder = '🔍 Search services...';
    this.searchInput.spellcheck = false;
    this.searchInput.addEventListener('input', () => this._filter());
    wrap.appendChild(this.searchInput);

    this.listEl = document.createElement('div');
    this.listEl.className = 'awsg-list';
    wrap.appendChild(this.listEl);

    this.container.appendChild(wrap);
    this._injectStyles();
    this._filter();
  }

  _filter() {
    const q = this.searchInput.value.toLowerCase();
    this.listEl.innerHTML = '';
    const filtered = AWS_SERVICES.filter(s =>
      s.name.toLowerCase().includes(q) || s.full.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q)
    );
    filtered.forEach(s => {
      const row = document.createElement('div');
      row.className = 'awsg-item';
      row.innerHTML = `<div class="awsg-name">${s.name}</div><div class="awsg-full">${s.full}</div><div class="awsg-desc">${s.desc}</div>`;
      this.listEl.appendChild(row);
    });
    if (!filtered.length) this.listEl.innerHTML = '<div class="awsg-empty">No services found</div>';
  }

  _injectStyles() {
    if (document.getElementById('awsg-css')) return;
    const s = document.createElement('style');
    s.id = 'awsg-css';
    s.textContent = `
.awsg{display:flex;flex-direction:column;gap:10px;padding:12px 0;max-width:340px;margin:0 auto}
.awsg-search{width:100%;padding:10px 12px;background:var(--bg,#0a0e17);border:1px solid var(--border,#1e2a45);border-radius:8px;color:var(--text,#e0e6f0);font-size:14px}
.awsg-search:focus{outline:none;border-color:var(--accent,#3b82f6)}
.awsg-list{max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:4px}
.awsg-item{padding:10px 12px;background:var(--surface,#141b2d);border:1px solid var(--border,#1e2a45);border-radius:6px}
.awsg-name{font-size:14px;font-weight:700;color:var(--accent,#3b82f6)}
.awsg-full{font-size:11px;color:var(--muted,#7a8ba8)}
.awsg-desc{font-size:12px;color:var(--text,#e0e6f0);margin-top:2px}
.awsg-empty{font-size:13px;color:var(--muted,#7a8ba8);text-align:center;padding:20px}
`;
    document.head.appendChild(s);
  }
}
