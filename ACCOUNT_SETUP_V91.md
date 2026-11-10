# Forma v91 — accounts and email sharing

Apply to the v90 app. This patch adds a sidebar Sign in / Account button, sign out of this browser, email/password signup and login, email links, password recovery, optional Google/GitHub/Microsoft login, optional Turnstile, and verified-email board access. Share uses the same Supabase session. Local boards are preserved; signing out does not erase local board copies. Do not use a shared browser profile for private boards.

## Install
1. Back up your current site and export important boards.
2. Replace index.html, collaboration.js, style.css and sw.js; add account.js. Keep all other existing files, especially your configured cloud-config.js.
3. Run account-sharing-migration.sql in Supabase SQL Editor. This adds email invitations; do NOT rerun the original collaboration.sql. v90's live-collaboration-migration.sql is still required for live presence/activity.
4. Deploy to the same GitHub Pages URL. Reload, close old Forma tabs and reopen. Do not clear IndexedDB or site storage.

## Configure authentication
In Supabase Authentication, enable Email authentication and email confirmation. Set a suitable password policy (the new UI requires at least 12 characters for new passwords).
Under URL Configuration set Site URL to your actual Forma page, including its repository path. Add your exact app URL and the same URL with query parameters permitted to Redirect URLs (for example https://liszttrades.github.io/My-Planner-node/**). Keep this restricted to your own site. Board and recovery links use query parameters.
Configure custom SMTP for confirmation, magic links and password resets for other people. Supabase's default mail service is restricted to project-team addresses and is not a production mail service.

## Google and other providers
Enable Google in Supabase Authentication → Sign In / Providers. Create the Google OAuth web client, use the callback URL shown by Supabase as its authorized redirect URI, and enter its client ID/secret in Supabase only. Configure Google consent screen and testing/publishing status as appropriate. Add your site origin in Google's authorized JavaScript origins if required by your Google setup.
Only then add `providers: ['google']` to the existing window.FORMA_CLOUD object. Optional supported values are 'github' and 'azure' (Microsoft), after configuring those providers in Supabase too. Buttons only appear for configured values. Email login works with Gmail and other email addresses without Google OAuth.

## CAPTCHA
Create a Cloudflare Turnstile widget for your site's hostname (for example liszttrades.github.io). Add its PUBLIC site key as `turnstileSiteKey` in window.FORMA_CLOUD. In Supabase Authentication → Bot and Abuse Protection enable Turnstile CAPTCHA and enter the SECRET key there, never in website files. Deploy the widget before enabling enforcement and test sign-in, signup, email links and reset requests. Tokens are passed to Supabase for server validation and reset after each attempt.
Review Supabase Authentication → Rate Limits. CAPTCHA protects Auth endpoints; it does not prevent all bots, scraping, denial of service or abuse by authenticated users. GitHub Pages remains a public static website. No client-only check is a substitute for server enforcement.

Example additions to your existing configuration (keep your working URL and publishable key):
```js
window.FORMA_CLOUD = {
  url: 'YOUR_EXISTING_SUPABASE_URL',
  anonKey: 'YOUR_EXISTING_PUBLISHABLE_KEY',
  providers: ['google'], // only after provider setup
  turnstileSiteKey: 'YOUR_PUBLIC_TURNSTILE_SITE_KEY'
};
```
Do not upload this example with placeholder values. No database password, service-role key, OAuth secret or Turnstile secret belongs in browser code.

## Share
Sign in from the sidebar once. Open Share and enable sharing for a local board. Add a recipient email, choose Viewer or Editor, and click Add access. Click Copy link: the dialog confirms “Board link copied.” Send the link yourself. No invitation email is automatically sent. A recipient with a verified matching email claims the access when opening the board or refreshing shared boards. Uninvited recipients still request approval. Pending invitations have Revoke; accepted members have Remove access. Revoking server access cannot delete previously downloaded copies.

## Validation and limits
JavaScript syntax checks and isolated Node tests passed for auth redirect cleanup, board-link preservation, password recovery dispatch, account labels, missing-migration compatibility, and permission-error propagation. Existing v90 synchronization logic is retained.
Not deployed or tested against live Supabase/Google/SMTP/Turnstile. No live SQL execution or two-account browser verification was available. This is a patch for review and setup, not a claim of production verification.
Before release test signup/confirmation, invalid password, reload/session persistence, sign-out in two tabs, Google return, reset-link expiry, expired/failed CAPTCHA, Share without another login, Viewer versus Editor, pending invite/revocation, existing board save/reload, and concurrent card updates in two accounts. Confirm an unrelated account cannot read/edit the board or manage invitations.

Official setup references:
https://supabase.com/docs/guides/auth/auth-captcha
https://supabase.com/docs/guides/auth/social-login/auth-google
https://supabase.com/docs/guides/auth/redirect-urls
https://supabase.com/docs/guides/auth/auth-smtp
https://supabase.com/docs/guides/auth/rate-limits
