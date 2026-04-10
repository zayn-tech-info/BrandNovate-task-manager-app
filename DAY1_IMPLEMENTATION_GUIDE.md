# Day 1 Implementation Guide

## Scope Lock

Day 1 includes only these user actions:

1. User signs up.
2. User signs in.
3. User creates a task.
4. User views only their own tasks.
5. User updates task status.

Anything outside this list is non-blocking for Day 1.

## Day 1 Acceptance Criteria

- Sign up returns success for valid input and validation errors for invalid input.
- Sign in returns `accessToken` and user identity payload.
- Authenticated user can create a task with required fields.
- Authenticated user can fetch task list containing only their own tasks.
- Authenticated user can update task status on their own task.
- Unauthenticated requests to protected routes are denied.

## Minimal Data Shapes

### User

- `username` (string, required, min 3)
- `email` (string, required, unique, lowercase)
- `password` (string, required, min 6; stored hashed)

### Task

- `title` (string, required)
- `description` (string, optional)
- `status` (`todo` | `in-progress` | `review` | `completed`)
- `priority` (`low` | `medium` | `high`)
- `dueDate` (date, optional)
- `user` (ObjectId ref User, required)

Day 1 acceptance and tests should rely only on the fields above. **FUTURE:** `category` (string, optional, defaults to `Other`) may appear in the schema or API later but is not part of the Day 1 core flow.

## Minimal API Contract

### Auth

- `POST /api/auth/signup`
  - Request: `{ username, email, password }`
  - Success: `201 { message }`
- `POST /api/auth/signin`
  - Request: `{ email, password }`
  - Success: `200 { id, username, email, accessToken }`

### Tasks (Protected, `x-access-token`)

- `GET /api/tasks`
- `GET /api/tasks/:id`
- `POST /api/tasks`
- `PUT /api/tasks/:id`
- `DELETE /api/tasks/:id`
- `PATCH /api/tasks/:id/complete`
- `PATCH /api/tasks/:id/incomplete`

For `PUT`, `PATCH`, and `DELETE`, only task owners are authorized.

## Security Baseline

- Use JWT with `JWT_SECRET` and `JWT_EXPIRATION`.
- Read token from `x-access-token`.
- Never return password hash in API responses.
- Apply `helmet`, `cors`, JSON body parsing, and request logging.
