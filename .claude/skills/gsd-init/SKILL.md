---
name: gsd-init
description: "Check GSD updates and initialize GSD workspace"
---

TRIGGER when: User runs `/gsd init start` or asks to initialize get shit done.

<objective>
Check for GSD Core updates and initialize the project workspace by copying all needed workflows, templates, and skills from the global root to the local workspace.
</objective>

<process>
1. Run the initialization script: `node C:\Users\shaik\.gemini\antigravity-ide\scripts\gsd-init.cjs` in the workspace.
2. Present the update status and files copied to the user.
</process>
