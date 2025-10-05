# Experiment Log

This document records experiments and investigations that were tested but not implemented, along with the reasoning.

---

## 2025-10-05: Split TASKS.md into Multiple Files

**Hypothesis:** Splitting TASKS.md into multiple files (index + chapter files) would reduce token consumption for task management commands.

**Initial claim:** 85% token reduction

**Test methodology:**
- Measured current TASKS.md: 38,730 chars = ~9,682 tokens
- Created test index: 1,065 chars = ~266 tokens
- Measured chapters: Ch11 = 15,368 chars, Ch13 = 12,707 chars

**Actual results:**

| Scenario | Current | Simple Split | Smart Split (priority queue) |
|----------|---------|--------------|------------------------------|
| `/next` | 9,682 tokens | 7,285 tokens (24% savings) | 4,030 tokens (58% savings) |
| `/todo` | 9,682 tokens | 4,108 tokens (58% savings) | 4,108 tokens (58% savings) |

**Simple split:** Index + chapter files, no priority queue
**Smart split:** Index includes priority queue, must stay in sync

**Why `/next` savings are lower:**
- Must read multiple active chapters to find highest priority task (P2 in Ch11 vs P3 in Ch13)
- Can't know which chapter has highest priority without reading them

**Decision: NOT IMPLEMENTED**

**Reasoning:**
- 24-58% savings not worth the complexity for current backlog size (~786 lines)
- Would make sense for massive backlogs (thousands of tasks)
- Adds file management overhead (5-6 files instead of 1)
- Smart split requires keeping priority queue in sync (error-prone)
- Current single-file approach is simpler and adequate

**Threshold for reconsideration:** If TASKS.md exceeds 2,000 lines or 50,000 tokens, revisit this approach.

---

