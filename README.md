# Task Manager Frontend (React)

This is the minimal frontend for the assignment. It covers the required screens and talks directly to the Laravel API.

## Screens

- Login
- Projects list
- Project details with task list
- Create task form

## Notes

- The UI is intentionally simple and restrained.
- Members only see projects and tasks assigned to them.
- Admins can create tasks and close overdue tasks.
- Overdue rules are enforced by the backend, not mocked in the client.

## Environment

Create a `.env` file from `.env.example`:

```bash
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

## Local setup

```bash
npm install
npm start
```

## Verification

```bash
npm test -- --watchAll=false
npm run build
```

## Test credentials

- Admin: `admin@example.com` / `password123`
- Member: `member@example.com` / `password123`
