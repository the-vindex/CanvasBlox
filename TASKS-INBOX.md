# Task Inbox

**Purpose:** Queue for new tasks added while another Claude instance is working on TASKS.md

**Usage:** Use `/todo-inbox` to add tasks here. Use `/merge-inbox` to move tasks into TASKS.md.

---

## How This Works

When one Claude instance is running `/next` (actively working on tasks), it reads and modifies TASKS.md. To avoid conflicts, use this inbox to queue new tasks:

1. **Add tasks:** `/todo-inbox "Task description"`
2. **Merge later:** When the working instance finishes, run `/merge-inbox` to consolidate

---

## Inbox Queue

### Fix zoom reset calculation
- **Priority:** P2 (Bugfix)
- **Location:** Zoom reset function
- **Description:** Zoom reset function must calculate correct zoom level to fit the whole really placed blocks on the level onto screen
- **Current:** Reset zoom sets to 100% regardless of content
- **Expected:** Calculate zoom level that fits all placed content on screen
