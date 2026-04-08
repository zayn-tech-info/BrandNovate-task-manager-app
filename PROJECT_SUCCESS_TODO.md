# 2-Day Product-First Success TODO

Goal: deliver a usable, demo-ready task manager in 2 days with focus on visible user value.

## Day 1 - Core User Value

- [ ] Confirm MVP flow: sign up, sign in, create task, update task status, view task list.
- [ ] Finalize minimal API contracts needed for the MVP flow (auth + tasks).
- [ ] Implement or verify auth happy path end-to-end (register/login/token usage).
- [ ] Implement or verify task CRUD happy path end-to-end for an authenticated user.
- [ ] Connect frontend screens to the live API for one complete happy path journey.
- [ ] Add clear empty, loading, and error states for the primary task list screen.
- [ ] Write a short manual test checklist for Day 1 flow and run it once.
- [ ] Record blockers immediately with owner and next action.

## Day 2 - Demo Readiness

- [ ] Fix all Day 1 blockers that break the demo journey.
- [ ] Tighten input validation for auth and task payloads (required fields, basic limits).
- [ ] Add basic security checks (helmet/cors config sanity, protected task routes).
- [ ] Improve UX polish on core screens (messages, button states, form feedback).
- [ ] Prepare demo seed data (one realistic user account and sample tasks).
- [ ] Run a full clean-start smoke test from setup to demo in under 5 minutes.
- [ ] Create a short demo script (2-3 minutes) with exact click-through steps.
- [ ] Document run/start commands and required env vars in one visible place.

## Definition Of Done

- [ ] A new user can register, log in, and manage tasks end-to-end without manual DB edits.
- [ ] Core flows have no blocking errors during a complete local demo run.
- [ ] Project can be started and demonstrated from a clean setup in under 5 minutes.
- [ ] Known limitations are listed clearly so demo expectations stay aligned.

## Out Of Scope Now (Do Later)

- [ ] Advanced role/permission systems.
- [ ] Complex analytics/reporting dashboards.
- [ ] Deep performance optimization and large-scale architecture changes.
- [ ] Full enterprise-grade observability stack.

## Blockers Log

- [ ] None yet.
  - Owner:
  - Next action:
