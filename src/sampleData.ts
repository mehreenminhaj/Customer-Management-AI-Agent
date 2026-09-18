import { CustomerMessage } from './types';

export const INITIAL_MESSAGES: CustomerMessage[] = [
  {
    id: 'MSG-1082',
    customerName: 'Marcus Vance',
    customerEmail: 'm.vance@techcorp-solutions.io',
    channel: 'Email',
    receivedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    subject: 'Urgent: API rate limit errors blocking checkout service',
    content: 'Hi Support, our production checkout integration suddenly started throwing 429 Too Many Requests errors 15 minutes ago. We have verified our traffic is well under our enterprise tier threshold. Transactions are failing and customers cannot complete orders. Can someone look into our quota cluster immediately?',
    category: 'Technical Support',
    sentiment: 'Urgent',
    priority: 'Critical',
    summary: 'Enterprise client experiencing unexpected 429 API rate limit errors causing checkout transactions to fail in production.',
    keyIssues: ['429 Too Many Requests error', 'Checkout pipeline failure', 'Enterprise quota misallocation'],
    suggestedAction: 'Immediately escalate to Tier 3 Infrastructure on-call and temporarily elevate rate allowance for org token.',
    autoResponse: `Dear Marcus,

Thank you for contacting Technical Support. We understand this is a critical production issue impacting your checkout transactions.

Our Cloud Infrastructure and Engineering on-call team has been alerted immediately and is actively inspecting the rate-limiter routing cluster for your enterprise organization. 

We have flagged your ticket (MSG-1082) with Critical Priority and will provide you with a live technical status update within 15 minutes. If you have any additional error trace IDs, please reply directly to this message.

Sincerely,
Customer Support Team`,
    responseStatus: 'draft',
    status: 'analyzing',
    syncedToSheets: false,
  },
  {
    id: 'MSG-1081',
    customerName: 'Elena Rostova',
    customerEmail: 'elena.rostova@zenithdesign.com',
    channel: 'Support Portal',
    receivedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    subject: 'Duplicate charge on invoice #INV-9402',
    content: 'Hello, looking at our credit card statement this morning, our company was charged twice ($249.00 x 2) for the annual Pro seat renewal on September 14. Could you please verify our billing records and issue a refund for the duplicate transaction?',
    category: 'Billing & Refunds',
    sentiment: 'Neutral',
    priority: 'High',
    summary: 'Customer reports an accidental duplicate charge of $249.00 on annual subscription invoice #INV-9402 and requests a refund.',
    keyIssues: ['Duplicate billing transaction', '$249.00 duplicate deduction', 'Invoice #INV-9402 verification'],
    suggestedAction: 'Audit Stripe billing charges for zenithdesign.com, void duplicate charge, and issue refund receipt.',
    autoResponse: `Hi Elena,

Thank you for reaching out to our Billing Department.

We have received your report regarding the duplicate charge of $249.00 on invoice #INV-9402. We apologize for the inconvenience this may have caused. 

Our finance team has already initiated a review of your billing history. Once the duplicate transaction is confirmed, the refund will be processed immediately back to your original payment method, which typically reflects within 3-5 business days.

We will send you the official refund receipt shortly.

Best regards,
Billing Support`,
    responseStatus: 'sent',
    status: 'responded',
    syncedToSheets: false,
  },
  {
    id: 'MSG-1080',
    customerName: 'Devon Kim',
    customerEmail: 'devon@kimcreative.co',
    channel: 'Web Chat',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    subject: 'Webhook support for custom CRM sync',
    content: 'Hey team! Loving the platform so far. Are there plans to add outbound webhook triggers whenever an item changes state? We use a bespoke internal CRM and would love to stream events in real time without polling the REST endpoints constantly.',
    category: 'Feature Request',
    sentiment: 'Positive',
    priority: 'Low',
    summary: 'Customer expresses appreciation and inquires about roadmap availability for outbound webhooks on state changes to integrate with their bespoke CRM.',
    keyIssues: ['Outbound webhook triggers', 'Avoid continuous REST polling', 'Custom CRM automation'],
    suggestedAction: 'Log feedback in Product Roadmap board and provide public webhook beta timeline.',
    autoResponse: `Hi Devon,

Thanks so much for the kind words! We are thrilled to hear you are enjoying the platform.

Outbound event webhooks are actually currently in active private preview on our Q4 roadmap. Our team is building native support for status transition triggers, which will allow seamless streaming into custom CRM environments without the overhead of polling.

I have linked your account to the beta cohort so you will receive early access instructions as soon as the test group opens. 

Warm regards,
Product & Customer Success Team`,
    responseStatus: 'draft',
    status: 'analyzing',
    syncedToSheets: false,
  },
  {
    id: 'MSG-1079',
    customerName: 'Sarah Jenkins',
    customerEmail: 's.jenkins@enterprise-logistics.org',
    channel: 'Email',
    receivedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    subject: 'Volume licensing quote for 150 team members',
    content: 'Good morning, we are expanding our field dispatch operations and need to onboard approximately 150 team members next month. Does your team offer customized volume tiers, SAML SSO provisioning, and dedicated onboarding assistance?',
    category: 'Sales Inquiry',
    sentiment: 'Positive',
    priority: 'High',
    summary: 'Enterprise prospect requesting volume licensing pricing for 150 seats, SAML SSO integration, and dedicated onboarding.',
    keyIssues: ['150 seats volume pricing', 'SAML SSO enterprise requirement', 'Dedicated onboarding support'],
    suggestedAction: 'Route to Enterprise Sales executive for tailored proposal and demo setup.',
    autoResponse: `Hello Sarah,

Thank you for considering our platform for your team's expansion!

Yes, our Enterprise solution includes volume discount tiers for 100+ seats, full SAML 2.0 / Okta / Azure AD Single Sign-On, alongside a dedicated Customer Success Manager to assist with white-glove onboarding.

I have notified our Enterprise Solutions Director, who will reach out directly with a custom quote and schedule a walkthrough tailored to your field dispatch workflow.

Kind regards,
Enterprise Sales Team`,
    responseStatus: 'draft',
    status: 'analyzing',
    syncedToSheets: false,
  }
];
