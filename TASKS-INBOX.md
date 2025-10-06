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

### [2025-10-06] Move Task 11.10 (Tile Overlap Logic) earlier in priority
- **Priority:** P2
- **Action:** Renumber tasks to move 11.10 to position 11.5 (before linking/button tools)
- **Current position:** Task 11.10
- **Target position:** Task 11.5 (push current 11.5-11.9 down to 11.6-11.10)
- **Reason:** Foundational logic needed before other drawing tools, already noted as priority in Chapter 11
- **Note:** Task 11.2 (rectangle tool) currently being worked on - don't renumber 11.0-11.4

### [2025-10-06 17:30] Investigate HTML-to-plaintext tool for MCP browser fetches
- **Priority:** P1
- **Suggested chapter:** New chapter or AI config improvements
- **Notes:** MCP browser calls (e.g., mcp__playwright__browser_navigate) return full HTML snapshots that consume massive tokens. The Medium article fetch used ~23k tokens just for HTML structure. Need pre-filtering tool that:
  - Converts HTML to clean plaintext/markdown
  - Strips navigation, ads, boilerplate
  - Preserves article content only
  - Integrates with MCP or as post-processing step
- **Potential solutions:**
  - Readability algorithm (Mozilla's parser)
  - html2text library
  - Playwright content extraction before snapshot
  - Custom MCP tool wrapper
- **Impact:** Could reduce web fetch token usage by 80-90%
