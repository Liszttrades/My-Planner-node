# Forma v90 · Live board collaboration

Apply this update to the existing v89 Forma repository. It contains only changed files and intentionally does not include cloud-config.js.

1. In Supabase, open the existing **Forma Node Planner** project. In **SQL Editor → New query**, run the complete `live-collaboration-migration.sql` from this ZIP. Do **not** rerun `collaboration.sql` on an existing project. This migration adds private Realtime signals and activity tracking without replacing existing boards or permissions.
2. Upload the four website files from this ZIP to the same GitHub Pages source folder as the current editor: `index.html`, `collaboration.js`, `style.css`, and `sw.js`. Leave the working `cloud-config.js` and all other existing files in place.
3. Wait for GitHub Pages to deploy. Close other Forma tabs, reopen, and refresh. If the previous version is still visible, delete only the old `forma-shell-v89` entry in DevTools → Application → Cache Storage, then reload. Do not clear all site data or IndexedDB.
4. Open a test board and sign in. Choose **Share → Enable sharing for this board → Copy link**. Send that link yourself. The recipient signs in and chooses **Open board / request access**. Reopen Share as the owner and approve them as **Editor** (or **Viewer** for read-only cloud access). The recipient reopens the link or opens the board from **Shared with you**.
5. Open the same shared board in two browser profiles signed into different authorized accounts. Expand **Live** to see people and recent card activity. Edit and leave a card on one side, and check that the other side sees the saved edit and its name badge. Check an unapproved account cannot see the board, and a viewer cannot publish changes.

The release syncs completed changes, not individual keystrokes. The name comes from account metadata when available, otherwise from the part of the sign-in email before @. Card badges highlight recent updates for two minutes; active names expire after about 45 seconds when they stop sending presence. Two different card edits can merge. If two people change the same card incompatibly, sync pauses for that board. **Share → Reload shared version** saves unsynced work as a separate local backup before replacing the view. When a remote board update is applied, the board's old undo snapshots are discarded so Undo cannot silently revert another person's work.

Live Supabase validation requires the migration and two test accounts; this ZIP has not been deployed to your project.
