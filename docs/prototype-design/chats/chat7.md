# Comment UI

_Started 2026-04-26 12:50 UTC_

---

## User

Apply comment

## Assistant

I'll read the current file to understand the structure before making changes.

_[tool: list_files]_

_[tool: read_file]_

Let me check the shared file and Bloomly.html to understand the dispatch actions and reducer:

_[tool: grep]_

No existing actions for delete/edit/complete. Let me check the reducer:

_[tool: grep]_

_[tool: read_file]_

Now I have enough context. Let me add the necessary reducer actions and update the GoalCard with edit/delete/complete functionality.

_[tool: grep]_

_[tool: snip]_

Now let me plan the changes:

1. **Reducer additions in Bloomly.html:**
   - `DELETE_TASK_FROM_GOAL`, `DELETE_ROUTINE_FROM_GOAL`
   - `EDIT_TASK_IN_GOAL`, `EDIT_ROUTINE_IN_GOAL`
   - `DELETE_GOAL`, `EDIT_GOAL`
   - `COMPLETE_GOAL` (awards bonus + unlocks reward)
   - `COMPLETE_ROUTINE_PERMANENT` (mark routine done forever)

2. **plans-tab.jsx GoalCard updates:**
   - Hover shows edit/delete buttons replacing streak/type icons (desktop)
   - Mobile swipe-left reveals action buttons
   - Goal-level edit/delete buttons in expanded footer
   - "Mark goal complete" button when all tasks/routines done — shows reward modal
   - Routine "complete permanently" option

Let me add the reducer cases first:

_[tool: str_replace_edit]_

Now the bigger update — modify plans-tab.jsx to add hover/swipe actions on tasks/routines, edit/delete for goals, and "mark complete" button with reward.

_[tool: str_replace_edit]_

Now let me also remove the duplicate `// ── Goal Card ──` header (it appears earlier in the file before `todayISO`):

_[tool: grep]_

_[tool: str_replace_edit]_

_[tool: read_file]_

_[tool: snip]_

Now I need to replace the task and routine rendering in the GoalCard with `SwipeableItemRow`, and add edit/delete/complete UI. Let me read the current expanded state of the file:

_[tool: read_file]_

Now let me replace the tasks block with swipe-able rows that include edit/delete actions:

_[tool: str_replace_edit]_

_[tool: snip]_

Now let me look at the part where the routine form ends and the closing of expanded section, to add goal-level edit/delete/complete functionality:

_[tool: read_file]_

_[tool: snip]_

Now let me add the goal-level edit/delete/complete UI. I'll insert it after the routine form section, before the closing of the expanded div:

_[tool: str_replace_edit]_

_[tool: snip]_

Now let's verify and finish:

_[tool: done]_

_[tool: snip]_

_[tool: fork_verifier_agent]_

Added edit/delete actions for tasks, routines, and goals — plus a "Mark goal complete" celebration with 🏆 trophy + 50-coin reward, and a "graduate" option for routines.

**Tasks & routines**
- Hover (desktop) reveals edit ✏️ and delete 🗑 buttons inline, replacing streak/resource icons
- Swipe-left (mobile) reveals colored action drawer behind the row
- Routines also get a ✓✓ "permanently complete" action that graduates them with a small bonus

**Goals**
- Edit / Delete buttons in the expanded card footer (under the +Task/+Routine row)
- Edit modal lets you change title and life area
- Delete is gated by a confirmation dialog

**Goal completion**
- A golden "🏆 Mark goal as complete" CTA appears only when every task and routine is done
- Tapping it shows a celebration modal listing rewards: +50 bonus coins, a unique 🏆 trophy unlocked in the garden shop, and the plant locked into its blooming stage forever
- Once claimed, the card shows a persistent "Goal completed!" banner

## User

Verifier agent check completed

## Assistant

## Assistant

## User

Address these comments from my teammates:

**Fernando**:
These priorities should be set only once or, at least, shouldn't be that easy to change.

For that, first time the user logs in, will be hinted to this view, were he will need to set some priorities in a modal. The modal should be rendered with a row per life area, as follows:
Health | + 0 - |
Career | + 0 -
 and so on
They will get some short explanation as a header, and some info icon pero area of life with a short explanation for each area so that they can better decide.
They'll have here an assigned budget of 30 points. This bdget will be shown at the begining as a 30, with all areas set to 0. every time a new point is allocated in an area of life, the budget gets one point less (and viceversa). once the user gets to 0 in budget, they will be able to click on "save and lock my priorities"

After that, they will see this wheel with the selected values. They won't be able to change them again (at least for a good while).

This also means the elements for "Tap a label..." and the budget info can be removed form this card

## Assistant

