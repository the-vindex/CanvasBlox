#!/bin/bash

# Auto-implement script for Claude Code
# Runs /next command in full auto mode with context resets

set -e

MAX_ITERATIONS=20
OPEN_QUESTIONS_FILE="docs/OPEN_QUESTIONS.md"
TIMEOUT_MINUTES=10

# Initialize open questions file
cat > "$OPEN_QUESTIONS_FILE" << 'EOF'
# Open Questions from Auto-Implementation

This file contains questions, assumptions, and decisions made during automatic implementation.
Review this file after the auto-implementation is complete.

---

EOF

echo "🤖 Starting auto-implementation with maximum $MAX_ITERATIONS iterations..."
echo "📝 Open questions will be logged to: $OPEN_QUESTIONS_FILE"
echo "⏱️  Timeout per iteration: $TIMEOUT_MINUTES minutes"
echo ""

for i in $(seq 1 $MAX_ITERATIONS); do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔄 Iteration $i of $MAX_ITERATIONS"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""

    # Create prompt for this iteration
    PROMPT=$(cat << 'PROMPT'
You are running in FULL AUTO MODE. Complete the next task from TASKS.md autonomously.

CRITICAL RULES:
1. Run /next to get next incomplete task (skip ⏭️ SKIPPED tasks)
2. DO NOT ask questions - make reasonable assumptions
3. Log ALL decisions to docs/OPEN_QUESTIONS.md:
   ```
   ## Task [N.X]: [Task Name]
   **Question:** [What you would have asked]
   **Assumption/Decision:** [What you decided and why]
   ---
   ```
4. Follow docs/TASK_MANAGEMENT.md workflow (TDD, testing, commits)
5. Follow docs/TDD_PRINCIPLES.md (Red-Green-Refactor cycle)
6. Run npm test && npm run test:e2e before committing
7. Mark task "✅ COMPLETE" when done
8. After commit: EXIT session immediately

BEGIN NOW. Run /next and complete task. After commit, EXIT.
PROMPT
)

    # Run Claude Code with timeout
    # Using timeout command to ensure process doesn't hang
    # --dangerously-skip-permissions: Auto-accept all tool permissions
    # --dangerously-skip-confirmations: Auto-accept all confirmations
    timeout ${TIMEOUT_MINUTES}m claude --dangerously-skip-permissions --verbose -p "$PROMPT" || {
        EXIT_CODE=$?

        if [ $EXIT_CODE -eq 124 ]; then
            echo ""
            echo "⏱️  Iteration $i timed out after $TIMEOUT_MINUTES minutes"
            echo "📝 Check $OPEN_QUESTIONS_FILE and git log for partial progress"
            echo "⚠️  Continuing to next iteration..."
            echo ""
            continue
        elif [ $EXIT_CODE -ne 0 ]; then
            echo ""
            echo "❌ Claude Code exited with error code $EXIT_CODE"
            echo "📝 Check $OPEN_QUESTIONS_FILE for details"
            exit 1
        fi
    }

    echo ""
    echo "✅ Iteration $i completed"
    echo ""

    # Check if there are more tasks to complete
    # Look for "⏸️ Not Started" or "🔄 In Progress" in TASKS.md
    # Ignore "⏭️ Skipped" tasks as they should be skipped
    if ! grep -q -E "⏸️ Not Started|🔄 In Progress" TASKS.md 2>/dev/null; then
        echo "🎉 All tasks completed or skipped!"
        echo "📝 Review $OPEN_QUESTIONS_FILE for questions and decisions"
        exit 0
    fi

    # Small delay between iterations for stability
    echo "⏸️  Waiting 3 seconds before next iteration..."
    sleep 3
done

echo ""
echo "⚠️  Reached maximum iterations ($MAX_ITERATIONS)"
echo "📝 Review $OPEN_QUESTIONS_FILE for questions and decisions"
echo "🔍 Check TASKS.md for remaining tasks"
