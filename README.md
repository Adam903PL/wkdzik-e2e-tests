# WKDZIK E2E Tests

End-to-end test suite built with Playwright for [wkdzik.pl](https://wkdzik.pl/).

This repository contains automated tests for the most important store flows:
- homepage loading
- user login
- adding products to the basket
- checkout navigation and form flow
- main navigation links
- sorting, filtering, and search
- form validation
- basket interactions

The suite is based on the scenarios defined in [Test.md](./Test.md), but the implementation has been updated to match the current UI and live behavior of the store.

## Stack

- Node.js
- Playwright
- TypeScript

## Project Structure

```text
tests/example.spec.ts     main E2E scenarios
playwright.config.ts      Playwright configuration
Test.md                   source test scenarios
.env                      local login credentials for tests
playwright-report/        HTML report generated after test runs
test-results/             Playwright artifacts, traces, and failure output
```

## What The Suite Covers

The suite contains 25 scenarios executed across:
- Chromium
- Firefox
- WebKit

Key principles used in this project:
- tests do not stop at URL changes and verify real outcomes
- assertions are strengthened against the current UI
- checkout is tested without placing a real order
- login credentials are loaded from `.env`
- flows that only require an authenticated session can safely fall back to a disposable account if needed

## Requirements

- Node.js 20 or newer
- dependencies installed from `package-lock.json`
- local Playwright browsers installed

## Installation

```bash
npm install
npx playwright install
```

## `.env` Configuration

Create a local `.env` file in the project root:

```env
WKDZIK_LOGIN_EMAIL=your_email
WKDZIK_LOGIN_PASSWORD=your_password
```

The `.env` file is ignored by git and should never be committed.

## Running Tests

Run the full suite:

```bash
npm test
```

Run in headed mode:

```bash
npm run test:headed
```

Run Chromium only:

```bash
npm run test:chromium
```

Run a single scenario by ID:

```bash
npx playwright test tests/example.spec.ts --grep "TC_WKD_005"
```

## Reports

After a test run, Playwright generates an HTML report in `playwright-report/`.

Open the report with:

```bash
npm run test:report
```

## Checkout Safety

The checkout scenario clicks the final order button, but the POST request responsible for creating the real order is intercepted and aborted. This means the test:
- goes through the real checkout flow
- validates the form and outgoing payload
- does not create a real order in the live store

## Repository Guidelines

- do not commit `.env`
- do not commit `playwright-report/` or `test-results/`
- run the full suite locally before larger refactors
- when the UI changes, compare the current live flow first and then update selectors and assertions

## Current Status

Last full local verification:

```text
75 passed
3 browsers
0 failed
```

## Author

Prepared as a Playwright E2E automation project for WKDZIK.
