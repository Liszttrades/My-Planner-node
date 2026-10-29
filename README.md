# Forma — Visual planner

A static website with draggable notes, image uploads, checklists and connected nodes. No installation, build step, API key or backend required.

## Upload to GitHub Pages

1. Extract this ZIP on your computer.
2. Upload **index.html, style.css, app.js and .nojekyll** into the root of your GitHub repository. Upload the extracted files, not the ZIP or its enclosing folder.
3. In your repository, open Settings → Pages. Choose Deploy from a branch, then main and / (root). Save.
4. Open the Pages URL shown by GitHub when the deployment completes. If replacing an older version, hard refresh the page (Ctrl + Shift + R).

Keep all three website files together. Relative asset paths work on both repository URLs and custom domains. This package contains no account credentials or hosting-provider configuration.

## Use

- Add notes or checklists from the toolbar. Double-click the canvas to create a note.
- Upload, drag-and-drop, or paste images. Images over 1800 px are resized for browser storage; each uploaded file must be under 25 MB.
- Drag a card to move it. Drag its bottom-right corner to resize. Double-click or use the three-dot button to edit.
- Click a card's side handle, then another card, to connect. A preview line follows your pointer. Click a connection to remove it.
- Drag empty space or hold Space to pan. Scroll to pan; Ctrl/Command + scroll to zoom. Use Fit to show all cards.
- Ctrl/Command + Z to undo; Shift + Ctrl/Command + Z to redo. Select a card then Delete to remove it. Undo history lasts until reload.
- Click the board title to rename. Use + to add a board.

## Saving and moving your boards

Notes and images are saved in IndexedDB in the current browser and website origin. There is no cloud sync, account, collaboration, or server upload. Clearing site data removes saved boards. Private browsing may not retain them.

Export each board as a JSON backup. Import that JSON on another browser or website. **Moving from the ChatGPT-hosted version to GitHub Pages does not move your boards automatically:** export them from the old website and import them on the new one.

## Changes in this package

- Removed slogans, decorative quotes, sample artwork, and prefilled example cards. New installations start with an empty board.
- Added card entrance, edit feedback, drag lift/drop, checklist and dialog animations.
- Added animated connection creation and a live dashed connection preview.
- Reduced header clutter and improved card controls. Uses system fonts without external font downloads.
- Respects reduced-motion preferences. Existing saved user content is not removed.

## Board controls and colors (v3)

Right-click a board, or use its three-dot button, to rename, pin, archive or delete it. Pinned boards sort first. The Archive button shows archived boards; their menu includes Restore board. Deletion requires confirmation and is undoable with Ctrl/Command Z until reload. Existing notes and images are preserved.

The mouse wheel now zooms around the cursor. Drag empty canvas to pan, or use Shift + wheel for horizontal movement. Dark mode uses neutral charcoal surfaces. The note palette includes all 18 colors from the supplied reference plus black, white and the original colors, with automatic text contrast.

## v4
Board renaming now edits the name directly in the sidebar. Enter or clicking elsewhere saves; Escape cancels. Dark surfaces are near-black.

## v5 — Live card editing
Double-click a card or click its three-dot button to edit its title and notes directly on the canvas. Changes save as you type. Click Done, press Escape or click outside to finish. Checklist text uses one item per line while editing. Colors, duplicate and delete controls are inside the card. Card shadows and grid contrast are stronger in both themes.
