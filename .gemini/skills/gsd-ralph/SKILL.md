---
name: gsd-ralph
description: "Iterative development loop utilizing Graphify for context, Ralph Loop for test-driven execution, and CodeRabbit for AI review"
---

TRIGGER when: User asks to build/fix code using Ralph / GSD loop, or runs `/gsd ralph <task>`.

<objective>
Execute a relentless development loop:
1. Update and query **Graphify** to gather precise codebase and dependency context.
2. Run the **Ralph Loop** (up to 5 iterations):
   - Implement/refactor code.
   - Run tests. If they fail, feed logs back and auto-fix.
3. Perform a **CodeRabbit AI Review**:
   - Analyze diffs for bugs, edge cases, security, and styling.
   - Output comments to `.planning/CODERABBIT_REVIEW.md`.
   - Auto-apply fixes for Critical or Warning level issues.
</objective>

<process>
### Step 1: Codebase Context (Graphify)
Run: `node C:\Users\shaik\.gemini\antigravity-ide\scripts\gsd-ralph-loop.cjs graph-context <task_details>`
Use the returned call graph, shortest paths, and code references to identify target files and architectural dependencies.

### Step 2: Implementation & Ralph Loop
Ask the user for the task details, or proceed if already specified.
For up to 5 iterations:
1. Implement the requested code changes.
2. Run tests: `node C:\Users\shaik\.gemini\antigravity-ide\scripts\gsd-ralph-loop.cjs run-tests`
3. If the test output is `PASS`, break the loop.
4. If it is `FAIL`, analyze the truncated error log, make adjustments, and retry.
5. If the loop completes 5 iterations without passing, pause and ask the user for guidance.

### Step 3: CodeRabbit Review
Once tests pass:
1. Generate the git diff: `node C:\Users\shaik\.gemini\antigravity-ide\scripts\gsd-ralph-loop.cjs git-diff`
2. Perform a deep, line-by-line review of the diff simulating the CodeRabbit engine:
   - Identify bugs, performance bottlenecks, security risks, styling violations, or missing tests.
   - Write the review in markdown format to `.planning/CODERABBIT_REVIEW.md`.
3. If there are Critical or Warning findings:
   - Apply fixes for them.
   - Re-run tests to verify the fixes did not break anything.
4. Display a summary of the CodeRabbit review findings and test results to the user.
</process>
