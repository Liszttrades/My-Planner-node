# Private board collaboration

The canvas works immediately on GitHub Pages. Online sharing needs your own Supabase project. It is disabled until configured; a downloaded board file is not a permission-protected collaboration link.

## One-time setup

1. Create a Supabase project. Open its SQL Editor and run `collaboration.sql` once.
2. In Authentication → URL Configuration, set your Site URL to `https://liszttrades.github.io/My-Planner-node/` and add that same URL as an allowed redirect URL. Keep the email provider enabled. Configure your email sender for production use.
3. Open `cloud-config.js`. Put the project URL in `url` and your **publishable key or legacy anon key** in `anonKey`. These are public project settings. Never use a secret key or service_role key.
4. Upload the updated website files to GitHub Pages. Keep `cloud-config.js` and `collaboration.js` next to `app.js`.
5. Click Share, enter your email, then open the sign-in link sent to you. Click Share again and choose Enable sharing for this board. Enabling sharing uploads this board, including its images, to your Supabase project.

## Invite and approve

Copy the board link and send it to your friend. Your friend opens the link, clicks Share, signs in, and chooses Open board / request access. They cannot read the board until approved.

As owner, open Share on that board. Choose Viewer or Editor beside the request and click Approve. Refresh the Share panel to see new requests. Your friend clicks Refresh shared boards, then opens the approved board. You can remove access from the same panel.

- Viewer: can view the shared board; any changes made to their local copy are not uploaded.
- Editor: can change the shared board. Changes sync about every four seconds while the board is open and idle.
- Owner: can edit and approve, decline, or revoke other people's access.

## Concurrent edits and backups

This uses version-checked board snapshots, not character-by-character multiplayer editing. If two editors save the same revision, the second save pauses instead of overwriting the first. Open Share → Reload shared version. Forma saves the unsynced local work as a separate local backup before loading the online version. Copy the changes you want from that backup.

Keep using Save for downloaded backups. Images stay embedded in the board; the client limits online snapshots to roughly 12 MB. Use smaller images for larger shared boards. Removing access prevents further server reads/writes; it cannot erase a copy someone already downloaded.

## Verification before inviting friends

Use two separate browser profiles with different accounts. Verify an unapproved visitor cannot open the board; approve Viewer and verify server writes are rejected; change to Editor through a new request after removing access, then verify edits sync. Revoke access and verify access stops. Try a concurrent edit to confirm conflicts pause and keep a local backup.

The SQL uses Row Level Security and checks permissions again inside save/approval functions. Do not disable RLS or expose secret keys. This package has not been connected to a live Supabase project, so authentication, approval and syncing require this setup and the checks above.

Supabase reference: https://supabase.com/docs/guides/auth/auth-email-passwordless
