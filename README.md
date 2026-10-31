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

## v6 — Readability
Card body and checklist text is 17px at 100% canvas zoom; titles are 20px. UI text sizes have increased. New cards start at 320px wide; existing card positions and widths are preserved. The inline color picker is now a compact dropdown with a color preview.

## v7 — Side palette
Click Color while editing a card to open a floating swatch palette beside it. The panel prefers the right side and switches left near the screen edge. Colors update live without enlarging the card. Click its close button or finish editing to dismiss it.

## v8 — Canvas polish
Card editing actions use 14px semibold text. Grid spacing never falls below 28 screen pixels; dots fade out between 80% and 35% zoom and remain hidden below 35%. Removed repeated footer instructions and the extra sidebar subtitle. All existing board and note data is retained.

## v9 — Studio canvas
- Black canvas and charcoal default cards, floating tool rail, collapsible board sidebar.
- Add menu for notes, checklists and images. Inline editing and all existing boards preserved.
- Bottom-left zoom menu: 50%, 100%, 200%, fit board, fit selected card, zoom in/out.
- Smooth animated zoom presets and fit; animated connection drawing and drag feedback.
- Snap to grid can be enabled/disabled in the zoom menu; preference saves on this device.
- Wheel zoom remains cursor-centered. Low-zoom grid fades to avoid visual noise.
- Ctrl/Command + +/- zooms; 0 resets; 1 fits board; 2 fits selected card.
- Dark mode is the default for new workspaces; existing appearance preference is retained.

Replace all files at the root of your GitHub Pages repository and hard-refresh after deployment. Board data stays in the same browser storage. Export a board backup before switching browsers or devices.

## v10 — Readability and connections
Larger 22px bold card headings, 18px body text, and 360px new cards. Existing narrow cards expand to at least 320px. Connection lines are thicker and meet detached circular input/output sockets. Hovering a card animates its connected lines and highlights its neighboring cards. Dotted world grid stays visible at every zoom. All zoom controls are limited to 50–200%.

## v11 — Connection routing and selection
Connections use left/right circular sockets according to card position, with shorter controlled curves. Click a connection to select it in red and show Delete connection. Click Delete to remove; undo restores it. Click elsewhere or Escape dismisses selection.

## v12 — Reliable connection selection
Slightly thicker lines, with an invisible 20px screen-space pointer target at every zoom. One relationship per pair of cards; reversed duplicates are prevented and existing duplicates are consolidated automatically. Desktop breakpoints at 1800px and 2400px improve controls, typography and sidebar spacing for 1080p and 1440p displays.

## v13 — Socket alignment and control polish
Connections and their live preview measure the actual socket layout. Minimum card width during resize matches the visible card width. Sidebar collapse/expand is now in the floating toolbar. Refined toolbar/menu padding and corner radii. Board deletion uses a compact confirmation with the board title and card count, without a redundant name field or blurred backdrop.

## v14 — Box selection and finer dots
Hold the right mouse button on the canvas and drag a box across cards to select them. Release, then left-drag any selected card to move the group with its spacing preserved. Ctrl/Command A selects all; Escape or clicking blank canvas clears the selection. Snap to grid applies one shared offset to the group. The 50% zoom grid uses finer, lower-contrast dots without disappearing.

## v15 — Selection effect and visible grid
Right-drag selection uses a neutral dotted marquee and translucent fill. Selected groups retain a bounding box; their internal connections animate with dashes. Dots have a pixel-aligned center and a visible minimum radius at 50% zoom to avoid disappearing between pixels.

## v16 — Static grid and draggable selection area
The background dot grid uses constant 28px screen spacing and a crisp 1px dot at every zoom. Connected sockets have a subtle radial finish; shared junctions get a slightly brighter rim. Left-drag empty space inside a group selection to move all its selected cards, preserving spacing and connections.

## v17 — Fine compact grid
Restored the finer background dots. Grid spacing ranges from 16px to 24px and stays capped at 24px while zooming in. All selection, group dragging and connection changes remain.

## v18 — Click to trace connections
Click a card to keep its connected lines animated, highlight its immediate neighbors and pulse connected sockets. Click another card to trace that card, or click blank canvas/Escape to clear. Reduced-motion preferences show a static highlight.

## v19 — Seamless connection flow
All animated connection states use a 10px dash plus 7px gap and travel exactly two complete periods (34px) per linear loop. The draft line retains its matching 24px cycle. This removes the mismatch at the animation restart.

## v20 — Visible card controls
Card-type labels are 16px bold (17px on large desktop screens), with a stronger header divider. Inline edit actions use contrasting boxed buttons, 16px labels and larger click targets.

## v21 — Light-mode contrast
Darkened normal and animated connection lines and circular ports in light mode. Dots now use a 1px radius while preserving the existing compact spacing.

## v22 — Quiet editing and inline title rename
Removed Done; outside-click saving remains. Edit actions inherit the card color with subtle borders. Hover a card title to reveal a pencil; click it to rename only that line. Enter or blur saves, Escape cancels. Dot radius reduced from 1px to 0.5px without changing spacing.

## v23 — Hollow unconnected sockets
Dots use a 0.7px radius with existing spacing. Connection sockets increase from 18px to 22px. Unconnected sockets have a muted hollow ring; connected sockets retain the filled center. Socket measurement keeps line endpoints aligned.

## v24 — Context creation and four-corner resizing
Right-click blank canvas without dragging to open the animated searchable add-card menu at the cursor. Right-drag still box-selects cards. Menu-created cards use that canvas position. Click a card to show four corner handles; drag any corner to resize width and height while anchoring the opposite corner. Sizes save with the board. Connection sockets follow the card, and dash phase is preserved through redraws. Compact project bar includes inline board name, Save backup, native file sharing (or download fallback), and Open board backup. Sharing sends a portable board file, not a cloud collaboration link.

## v25 — Wheel scrolling and proportional images
Wheel over a selected or edited overflowing note scrolls its content; wheel outside the card zooms again. Ctrl/Command wheel still zooms. Image cards have automatic proportional height without an oversized fixed frame. Image resizing locks proportions and caps width at the uploaded image's intrinsic width (within 360–1400px). Notes and checklists have a 360px minimum width and 220px minimum height, matching the default baseline. Image cards have a 360px minimum width and natural proportional height.

## v26 — Card context actions
Double-clicking blank canvas no longer adds a note. Right-click a card or selected group to open Duplicate/Delete actions. Duplicating a group preserves its internal connections; deleting removes the selected cards and incident connections. Both operations support Undo. Blank-canvas right-click creation and right-drag box selection remain.


## v27 — Inline rich text and card labels
Header labels rename directly on their own line. The header swatch opens card colors. Inline editing has no Duplicate/Delete row; these actions remain available from the card context menu. Notes support selected-text bold, italic, underline, yellow highlight, and paragraph alignment, saved on input and when clicking outside. Rich text persists in board backups and is sanitized before display.


## v28 — Checklist editing, image placement, canvas pen and private sharing
Use the hover pencil to edit checklist title and items. Only checkbox controls change completion; double-clicking task text does not edit or toggle it. Dropped images find open space in columns without overlapping existing cards. Note alignment is an icon-only popover with named hover tooltips. The footer color control is removed; use the top swatch. Clicking outside closes the color palette.

The Pen button (P) draws freehand on the canvas. Click it again or press Escape to exit. Right-drag a selection around drawings and cards, then left-drag to move them. Drawing strokes support duplication, deletion, Undo and board backups.

Share now opens private collaboration. See COLLABORATION_SETUP.md and collaboration.sql; cloud-config.js must be configured before online sharing works. Existing local storage remains in place. Cloud access requires email sign-in and owner approval, with Viewer/Editor roles. Synchronization uses version-checked snapshots with conflict backups, not simultaneous rich-text coediting. Cloud operations are not live-tested without a configured backend.


## v29 — Hover label pencil and smooth transparent pen
The top card label has a hover pencil that renames only that line. Drawings have fully transparent backgrounds in both themes, including existing drawings. Pen strokes use midpoint quadratic curves with round ends. Right-click the Pen button at any time, or right-click the canvas with Pen enabled, to open the width slider (1–24px), preset color palette and custom color picker. Settings apply to new strokes and save with the workspace; each stroke keeps its width and color through reloads, backups and sharing. Automatic contrast uses light ink in dark mode and dark ink in light mode. Click outside or press Escape to close the panel.


## v30 — Additive selection and middle-button navigation
Hold Shift and click individual cards or drawing strokes to add or remove them from selection. Shift-click does not start card editing or pen drawing, and leaves native text selection alone inside editors. Drag a selected item to move the selection together. Hold the middle mouse button (press the wheel) and drag to pan while Pen or another tool remains active; releasing restores the current tool. Pointer capture handles release outside the canvas.

Removed the unused legacy modal editor, its event handlers, and an overwritten sharing handler. Connection redraw requests are coalesced into a single animation-frame pass rather than rebuilding repeatedly within the same frame. Online collaboration keeps its existing optional setup.


## v31 — Eraser, saved groups, board search and drawing resize
Select a drawing and drag a corner to resize it proportionally. The longest side stops at 80 canvas pixels and ink stays at least 1.5px thick. Select multiple strokes to resize the whole selection using the outer group corners; the selection stops at 120px on its longest side. Card minimum sizes are unchanged.

Use Eraser (E) to erase whole strokes. Drag across more than one stroke in a single gesture; one Undo restores that gesture. Notes and images are never erased.

Shift-click items, then right-click → Group selection. Clicking any member selects the whole saved group, which moves together. Right-click → Ungroup to separate the items. Groups survive reloads, backups and online board snapshots. Duplicating groups creates separate group identities.

Use the magnifying glass or Ctrl/Command F outside an editor to search titles, labels and text in the current board. Click a result to center and select its card. Escape closes search.

Browser checks: single and group drawing resizing, 80px minimum, persistent grouping, note-content search, stroke erasing and Undo. Optional online collaboration still requires the supplied backend setup.


## v32 — Position locks and the Forma guide
Right-click a card, drawing or selection and choose Lock position. Locked items cannot be moved, resized or erased, including through group movement. They remain selectable, and card text, colors and checklist completion can still be edited. Right-click → Unlock position restores layout controls. Position locks persist in browser storage, downloaded backups and shared board snapshots. Lock and unlock support Undo. Explicit deletion remains available.

The sidebar Forma guide replaces the previous controls wall of text with eight illustrated steps: create cards, edit, navigate/search, connect ideas, select/group, draw/resize/erase, lock/unlock, and save/share. It includes topic navigation, progress, Back/Next buttons and keyboard arrow navigation, and adapts to both themes and smaller screens. Press ? to open it.

Verified in browser: locked card drag is blocked; unlocking permits movement; locked drawing groups survive erasing and reload; tutorial navigation and light/dark appearance.


## v33 — Open-space duplication and protected deletion
Duplicate now finds a nearby open position with space around existing cards and drawings. Multi-item duplicates preserve their layout, internal connections and independent group IDs. The viewport reveals the new selection if needed. Existing stacked items are not rearranged automatically.

Locked items must be unlocked before deletion. The context menu shows a disabled Unlock to delete action, and Delete/Backspace use the same check. Mixed selections with any locked item are blocked as a whole. Unlock first, then delete. Undo remains available for successful deletion.

Verified: nonoverlapping duplication, twelve consecutive placement calculations, locked delete menu, keyboard protection, and deletion after unlocking.


## v34 — Compact controls, stable tools, sidebar and image clipboard
Undo and Redo preserve the active Pen, Eraser or Pan tool while clearing unfinished connection mode. Canvas tool buttons are slightly smaller. The zoom control uses vector magnifier/chevron icons; context-menu icons and labels align to the left. Long board names wrap in the header and sidebar instead of being truncated.

The sidebar uses a black background in dark mode, simple outline icons, restrained active rows, and the existing Forma sections. Grid dots use a 0.8px radius with the previous spacing. Desktop styles support 1920×1080 and larger displays while retaining responsive smaller-screen rules; the website is not forced to a fixed pixel canvas.

Ctrl/Command V imports image clipboard files directly into image cards, even when a card editor had focus. Plain-text paste still works normally in text fields. Copied HTML image sources and image URLs are attempted as a fallback. Some remote websites block browser fetches: use the browser's Copy image action rather than Copy image address in that case. Existing open-space image placement is retained.

Verified in browser: draw → Ctrl Z → draw again without changing tools; direct PNG clipboard paste creates an image card; full long title is shown; light/dark sidebar and controls.


## v35 — Projects, beginning-only titles, lighter canvas and Undo
Dots return to 0.7px. Board titles use a single line with an ellipsis at the end; the beginning stays visible, and hovering reveals the full name. The default display reads 100% while the actual canvas scale is 0.85. Zoom presets and pointer coordinates use the same baseline. Existing workspace views migrate once without changing node dimensions.

Undo retains 100 session snapshots. Rapid key presses are applied together on an animation frame, with a subtle 120ms fade and no entrance animation for restored items. Pen/Eraser mode stays active.

Projects + creates named folders. Shift-click multiple sidebar boards, then drag a selected row onto a project heading. Drop onto All boards to move them out. Project headings collapse/expand; the dots beside a project let you rename or remove the folder. Removing a folder keeps its boards. Folder organization and board movement support Undo and persist after reload.

Member badges show approved access counts, not online presence: local boards show 1, shared counts show — until loaded, and 10 or more shows 10+. Existing cloud users must run member-count-migration.sql once; see COLLABORATION_SETUP.md. Keep your configured cloud-config.js during updates.

Verified in browser: folder creation, Shift-selecting two boards, dragging both into a folder, Undo/Redo of that move, persistence after reload, folder heading widths, and scale(0.85) at displayed 100%. The newest 100 history states were checked programmatically. Cloud member RPC requires backend setup and has not been live-tested.


## v36 — Immediate meaningful Undo and compact reference proportions
Undo applies synchronously and skips snapshots whose board content is unchanged, including empty editor openings. Panning no longer records an Undo step. UI preferences and the current viewport are preserved across Undo. A brief 65ms opacity transition replaces the longer fade. Image data is shared once across the history cache instead of being duplicated into each snapshot; all 100 steps are retained and unused cache entries are released when history is trimmed. IndexedDB saves and portable backups still contain the original image data.

The project bar is 354×42px on desktop. Zoom controls are 34px high, with vector fit/undo/redo icons, and the zoom menu is 224px wide with compact text. Dark-mode dots retain the 0.7px radius and spacing but have reduced contrast/opacity. This uses the reference's supplied dimensions while preserving Forma controls.

Verified: adding an unchanged note then one Ctrl Z removes it; three strokes then three Ctrl Z restores the original stroke count with Pen still active; DOM measurement confirms 354×42px project bar and 224px zoom menu. History cache test preserves 100 snapshots, restores images and ignores viewport-only changes.
