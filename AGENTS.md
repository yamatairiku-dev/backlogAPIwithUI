# Repository Guidelines

## Project Structure & Module Organization
Source files live at the repository root. `server.js` exposes the Express API and UI, while `index.html` provides the lightweight front end that lists runnable scripts. Operational scripts are numbered (`01getUsersToBeDeleted.js`, `14usersForDelete.js`) to signal execution order; keep new automation scripts in this pattern. Generated CSV/JSON artifacts belong in `output/` (already served statically). Configuration docs stay in `Readme.md` (Japanese) and `GEMINI.md`.

## Build, Test, and Development Commands
Install dependencies once with `npm install`. Run the UI/API locally via `node server.js` and visit `http://localhost:3000`. Execute individual maintenance jobs directly, e.g. `node 03getUsersNotLoggedInWithPjInfo.js`, or use Docker with `docker-compose up --build` when mirroring production credentials. Clean stale artifacts by pruning files inside `output/` before committing.

## Coding Style & Naming Conventions
The project uses ES modules (`type: "module"`); use `import`/`export` exclusively. Match the existing two-space indentation, single quotes inside template literals only when required, and prefer `const` for immutable bindings. Scripts are intentionally procedural; extract shared helpers into new modules only when multiple files consume them. Retain the numeric filename prefixes and Japanese log messaging conventions for operator familiarity.

## Testing Guidelines
No automated test runner is configured yet. Validate changes by running the impacted scripts and confirming the CSV/JSON outputs under `output/`. When altering API calls, capture before/after row counts and review timestamps for anomalies. If you introduce reusable logic, consider adding lightweight assertion scripts (e.g., `node ./tests/validate-output.js`) and document how to execute them in this guide.

## Commit & Pull Request Guidelines
Commits in this repository are concise and imperative (`Update GEMINI.md`, `出力ファイル名変更`). Follow that pattern, whether in English or Japanese, and group logical changes together. For pull requests, provide: (1) a summary of the operational goal, (2) required environment variables or sample `.env` entries, and (3) representative output snippets or screenshots from `output/`. Link backlog issues when available and call out any manual follow-up steps.

## Configuration & Security Notes
Populate `.env` with `MY_SPACE`, `API_KEY`, `EXCLUSION_PROJECTS`, `NOT_LOGGED_IN_DAYS`, and optional `PORT`; never commit secrets. `EXCLUSION_PROJECTS` should be a JSON-style array string (`["PJ1","PJ2"]`). When testing locally, mask API responses before sharing logs and rotate keys if accidental exposure occurs. Docker builds forward these values via build args, so clear them from shell history after use.
