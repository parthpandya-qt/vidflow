---
description: Enforce strict TDD workflow for implementation tasks.
alwaysApply: true
---

# Implementation TDD Workflow

Apply this rule when the user asks to implement, modify, refactor, or fix code.

## 1. Prerequisites Check (Before Coding)
- Verify if a test runner (e.g. Vitest) is installed and configured in the respective target directory (`backend/` or `frontend/`).
- If none is configured:
  1. Recommend installing **Vitest** (since both projects use ES Modules).
  2. Ask for permission to install the required devDependencies and configure the test script in `package.json`.
  3. Once installed, proceed to the TDD loop.

## 2. Mandatory TDD Loop Process
1. **Red (Write a failing test):** 
   - Write the test assertions first.
   - Run the test suite using `npm run test` or `npx vitest run` to verify that the test fails as expected.
   - **Show the test command and the exact failure message.**
2. **Green (Write the minimum implementation):**
   - Write ONLY the minimum code required to satisfy the failing test.
   - Run the test suite to verify the test passes.
   - **Show the test command and the passing test confirmation.**
3. **Refactor (Clean up):**
   - Refactor the code or the tests for clean separation of concerns and readability while keeping tests green.
   - Run the tests again to ensure no regressions were introduced.

## 3. Mocking & Isolation Policies
- **No Live Databases:** Mock Mongoose models and queries or use an in-memory database helper.
- **No Real Network Requests:** Use Vitest spies or mock API clients (like `axios`) to return mock server responses.
- **No Real File/Image Uploads:** Mock file upload middleware and Cloudinary APIs.

## 4. Mandatory Checkpoint After Every Small Step
Stop after each logical step and present:
- What was done.
- The test command execution output.
- Suggested Git commit message following Conventional Commits (e.g. `test(auth): add password hashing tests`, `feat(auth): hash password on register`).
- Request confirmation from the user before proceeding to the next step.

## 5. Step Response Template
Use this structure for each step response:

**Step Description:**
[Current small step details]

**Test Run Verification:**
```bash
# Command used to run tests
npm run test
# Output showing the failure or success message
```

**Test Code (Failing first):**
```javascript
// Test code
```

**Minimal Implementation (Only after approval):**
```javascript
// Minimal code to pass
```

**Refactor (If applicable):**
[Refactoring changes details]

**Suggested Commit Message:**
`git commit -m "type(scope): short message"`

**Spec File Location:**
`[path/to/test.test.js]`
