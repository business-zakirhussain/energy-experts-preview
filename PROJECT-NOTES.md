# Energy Experts — practical project notes

## The immediate deliverable

Horizon is a fifth, independent design direction in `deploy/design-5.html`: a polished one-page site with English, French, and Spanish, three services, sample projects, an approach section, company introduction, and an enquiry preview. It is intentionally plain HTML/CSS/JavaScript. The project cards and translations are data-driven; this demonstrates the visitor experience, not a finished admin system.

No testimonial, staff biography, certification, completed-project count, or revenue/performance claim has been invented. Short draft marketing copy is used instead of repeated lorem ipsum so the client can judge how the actual site would read. Project stories are explicitly illustrative.

## What the public websites tell us

- The [current Energy Experts site](https://www.energyexpertsbv.com/) lists Grimbergen, Belgium, and a +32 telephone number. That is stronger evidence for a Belgian operation than the phone prefix alone, but the client must confirm the registered entity.
- On 11 September 2026, the current website returned `server: Squarespace`; `www.energyexpertsbv.com` resolved through `ext-sq.squarespace.com`. This identifies the serving platform. It does not identify the domain registrar, account owner, plan, or physical data location.
- The [reference website](https://tis-gmbh.biz/en) emphasises services, expertise, project references, and contact. Those are useful structural references. Its text, partner logos, experience figures, and certifications should not be reused as claims for Energy Experts.
- Ask what the client means by “hosting provided.” A Squarespace subscription is a managed website platform, not automatically an upload location for arbitrary HTML or a PHP backend. Obtain the provider/plan details before promising deployment. Do not alter the existing DNS or email configuration until the migration is agreed.

## Keep the €1,000 scope concrete

Suggested baseline: one main page in three languages; up to three service sections; up to six initial projects using one reusable project layout; a contact form; the company/privacy/cookie information appropriate to the final setup; mobile layouts; basic search metadata; and deployment to compatible hosting. A simple project editor is the only initial admin requirement. Confirm image/text limits, translation responsibility, and what counts as a revision in writing.

Use the three agreed revision rounds as consolidated feedback: (1) design direction, (2) completed content and page, (3) final polish. Price new pages, new features, additional languages, additional rounds, ongoing content entry, and maintenance separately. Fixing implementation defects is different from charging for a new preference or feature. Specify that distinction and a reasonable defect-correction period in the agreement.

Professional translation, third-party subscriptions, stock photography, legal advice, domain/hosting charges, and ongoing support should only be included if explicitly budgeted. The current French/Spanish copy is draft material for review, not certified translation.

## How a mostly static site becomes editable

Think of the public site as the display and the editor as the place where project content is entered. The client fills in a title, category, description, and photos. Publishing creates or updates the files visitors see. The public pages can stay fast and static even though the content is editable.

Choose the smallest setup supported by the actual hosting:

1. Compatible static hosting with an established CMS publishing workflow: the editor saves structured content, then a build publishes the site. This is a good fit for occasional project additions, but someone must configure authentication and publishing.
2. Conventional hosting with PHP/database support: a small, maintained CMS can supply editing. Budget updates, backups, and account security; do not build a custom admin/login system merely to avoid a CMS.
3. Client stays entirely on Squarespace: implement within that platform’s supported editing and deployment model. The HTML mockup is a design reference, not a promise that arbitrary files can be uploaded into the plan.

Do not select or purchase the editing platform until the provider and access are known. Plain JavaScript project data is convenient for a developer, but is not itself a non-technical client editor. For search visibility in the final site, publish crawlable project content and separate language URLs with appropriate metadata/hreflang; the prototype language switch is not the complete multilingual SEO implementation.

## Security: small surface, real basics

Ctrl+U and developer tools will always expose the HTML, CSS, JavaScript, and assets delivered to a visitor. There is no reliable way to hide these while letting the browser display the website. Disable-right-click scripts do not secure a site. Passwords, API keys, email credentials, private documents, and admin functions must never be included in those public files.

The host can provide HTTPS and infrastructure controls. It does not automatically secure a form or an editor. For the final deployment, configure HTTPS and appropriate security headers, restrict admin access with strong passwords/MFA, validate and constrain form inputs on the server, prevent mail-header injection, rate-limit submissions, add spam controls, and use CSRF protection where cookie-authenticated requests need it. Keep dependencies maintained and make recoverable backups. Use the minimum data fields needed. Prefer simple first-party form handling over unnecessary tracking-heavy integrations.

The prototype already blocks network connections and form submission with its content security policy. Those restrictions must be deliberately revised when a real form endpoint is added. It has no backend or credentials. Hosting-level controls such as `frame-ancestors`, HSTS, and server-side protections still belong in deployment configuration.

The Figma token pasted into the conversation was not used or written to the site. Revoke it in Figma and create a new one only if actually needed. Do not send replacement tokens in chat.

## Belgian/EU privacy and publication

This is implementation planning, not a guarantee of legal compliance. Requirements depend on the registered company, services, audience, and actual data flows. The client must approve accurate company details and policies; have their legal adviser check any uncertain obligations rather than claiming every law is covered by a template.

The simplest initial setup is no analytics, no ad pixels, no embedded map/video, and locally hosted fonts. Horizon follows that model. A cookie banner is not required merely because a site exists: Belgium’s Data Protection Authority distinguishes strictly necessary storage from other trackers. Optional analytics cookies require prior consent; if introduced, provide a clear first-layer rejection option, granular choices, easy withdrawal, and block optional loading until consent. [Belgian DPA cookie guidance](https://www.autoriteprotectiondonnees.be/professionnel/themes/internet/cookies) and [cookie checklist](https://www.autoriteprotectiondonnees.be/publications/checklist-cookies.pdf).

Before launch, cover the actual setup:

- Confirm the registered name, enterprise number, VAT status, geographical/contact address, email, and applicable registry/professional details. Additional rules depend on the business activities. [Belgian FPS Economy: information on company websites](https://news.economie.fgov.be/203683-deze-info-moet-u-zeker-vermelden-op-uw-bedrijfswebsite/).
- Inventory enquiry data, admin accounts, server/security logs, backups, and any external services. “No cookies” does not mean “no personal data.”
- Identify the controller, purposes and lawful bases, recipients, transfers, concrete retention periods, security practices, and contact for data-rights requests. Give visitors clear privacy information when collecting data; explain applicable rights and the route to the Belgian DPA. GDPR Articles 5, 6, 12–14, 28, 32 and Chapter V are relevant starting points. [Official GDPR text](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).
- Document processor arrangements with hosting, CMS and form/email providers where applicable. Check subprocessors and international transfers; an EU server label alone is not the full assessment.
- Use an appropriate lawful basis for answering enquiries. A compulsory “I consent to everything” checkbox is not a substitute for determining that basis. Keep any optional marketing consent separate and unselected; omit newsletters unless requested.
- Agree who answers privacy requests, deletes old enquiries, maintains backups and software, and handles an incident. The company needs a workable process, not only a website policy.
- Audit the deployed site’s network requests, cookies and other storage on a fresh browser before and after each consent choice, in every language. Hosting/CDN features may introduce behaviour absent from this local prototype.
- Verify image licences, consent/permission for identifiable people, and permission to name projects or clients. Replace all illustrative project stories and approve all translated policies and service claims.
- Check whether sector-specific, consumer, accessibility, or language obligations apply to the actual offering. This proposal has no shop, payment processing, customer portal or recruitment feature; adding those changes the review.

The preview’s privacy/legal dialogs deliberately identify themselves as provisional. They must not be passed off as finished company policies. `noindex` in the prototype is intentional; replace it with appropriate production indexing configuration at launch.

## Realistic timing

Planning estimate after receiving usable content, approved design direction, hosting information and access: roughly 8–12 working days, usually 2–3 calendar weeks with prompt feedback. Allow about 40–65 focused hours depending on editing-platform setup and content quality. These are estimates, not a delivery promise; a new custom admin system or platform migration increases the scope.

- Design and content structure: 1–2 working days.
- Responsive build and three-language content integration: 3–4 working days.
- Project editor and real enquiry delivery: 1–2 working days if supported hosting is ready.
- Content/legal integration, accessibility/device checks and deployment: 2–3 working days.
- Client feedback or translation delays add elapsed time. Define review windows and include the three revision rounds in the schedule.

## A short message to send the client

“We’ve prepared a first design direction to show how your new site could feel. To make it yours, could you send us the following? Short answers and any existing documents are absolutely fine.”

1. **What should the website achieve?** Who do you most want to contact you, and what should they contact you about?
2. **What do you actually offer?** Please confirm the main services and any qualifications or company experience we may mention. A brochure or short voice note is fine.
3. **What should we use for the brand?** Please send your logo, preferred colours, existing brochure/text, and any photos you own or have permission to use.
4. **Which projects may we feature?** For 3–6 examples, send a name, location, a few lines about your role, and photos. Please confirm permission to name the client/project.
5. **What would you like to update yourself?** Just projects, or also services/news? Roughly how often?
6. **Who approves the languages?** We have English, French and Spanish planned. Which is the default, and who will check the wording in each? Are these the only languages your audience needs?
7. **Please confirm the business/contact details.** Registered name, enterprise/VAT information, address, phone, enquiry email, and any existing privacy/legal documents. Where should new enquiries go?
8. **Where will the website live, and when do you need it?** Please send the hosting/provider plan or introduce the person managing it. Is the existing Squarespace site being replaced? Who will give us one consolidated set of feedback for each revision round?

Internally, also confirm the fixed price, deposit/payment milestones, ownership/licensing, exact revision definition, recurring costs, and the post-launch support arrangement. These are contract details, not more design questions for a non-technical client.
