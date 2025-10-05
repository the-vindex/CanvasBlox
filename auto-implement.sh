#!/bin/bash

# Auto-implement script for Claude Code
# Runs /next command in full auto mode with context resets

set -e

MAX_ITERATIONS=20
OPEN_QUESTIONS_FILE="OPEN_QUESTIONS.md"
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

    # Create prompt file for this iteration
    PROMPT_FILE=$(mktemp)
    cat > "$PROMPT_FILE" << 'PROMPT'
You are running in FULL AUTO MODE. Your goal is to complete the next task from FEATURE_RESTORATION_PLAN.md without ANY user interaction.

CRITICAL INSTRUCTIONS:
1. Run /next command to get the next incomplete step
2. DO NOT ask the user ANY questions - make reasonable assumptions
3. Log ALL questions, assumptions, and decisions to OPEN_QUESTIONS.md in this format:
   ```
   ## Step [N]: [Step Name]

   **Question:** [What you would have asked]
   **Assumption/Decision:** [What you decided to do and why]
   **Reasoning:** [Your reasoning]

   ---
   ```
4. Mark the step as "✅ Complete (auto-accepted)" when done (not just "Complete")
5. Implement the feature fully following TDD:
   - Write tests FIRST
   - Implement the feature
   - Run all tests (npm test && npm run test:e2e)
   - Fix any failures
   - Commit with descriptive message
6. If you encounter any blockers or the step is already complete, log it to OPEN_QUESTIONS.md
7. Use your best judgment for:
   - Implementation details
   - Test coverage
   - Code organization
   - UI/UX decisions
8. Follow the existing code patterns and conventions in the codebase
9. After completing the step, YOU MUST EXIT THE CLAUDE CODE SESSION

FINAL STEP: After committing your work, you MUST end the session. Do NOT wait for user input.

BEGIN AUTO-IMPLEMENTATION NOW. Run /next and complete the step autonomously. After committing, EXIT.
PROMPT

    # Run Claude Code with timeout
    # Using timeout command to ensure process doesn't hang
    # --dangerously-skip-permissions: Auto-accept all tool permissions
    # --dangerously-skip-confirmations: Auto-accept all confirmations
    timeout ${TIMEOUT_MINUTES}m claude-code --dangerously-skip-permissions --dangerously-skip-confirmations < "$PROMPT_FILE" || {
        EXIT_CODE=$?
        rm -f "$PROMPT_FILE"

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

    rm -f "$PROMPT_FILE"

    echo ""
    echo "✅ Iteration $i completed"
    echo ""

    # Check if there are more steps to complete
    # Look for "⬜ Not Started" in FEATURE_RESTORATION_PLAN.md
    if ! grep -q "⬜ Not Started" FEATURE_RESTORATION_PLAN.md 2>/dev/null; then
        echo "🎉 All steps completed!"
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
echo "🔍 Check FEATURE_RESTORATION_PLAN.md for remaining steps"
