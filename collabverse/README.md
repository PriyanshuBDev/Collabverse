# Collabverse

**Collabverse** is a collaborative project management app for teams. It brings workspaces, projects, task planning, team communication, and a shared virtual project space together in one place.

> This README describes the features and stack present in the repository. Integrations such as authentication, database, file storage, and realtime updates require their corresponding services and environment variables.

## Features

### Workspaces and teams

- Create and manage workspaces, with workspace profiles and unique slugs.
- Invite teammates by username or invitation link; accept invitations and submit or review join requests.
- Browse and search workspace members, inspect member details, and manage membership.
- Assign workspace roles, configure role permissions, transfer workspace ownership, or leave and delete a workspace.
- View workspace activity and keep track of member presence and last-seen information.

### Projects and access control

- Create, browse, search, and manage projects within a workspace.
- Invite and manage project members, assign project roles, and configure project permissions.
- Set project descriptions, owners, due dates, and project imagery.
- Review project activity and project-level task views.

### Tasks and planning

- Create, edit, reorder, and delete tasks with descriptions, priorities, statuses, due dates, and assignees.
- Track work in a drag-and-drop board and a calendar view.
- Browse personal tasks across projects, search tasks, and filter task lists.
- Break work into subtasks and mark items complete or reopen them.
- Add task attachments and collaborate through task comments, mentions, reactions, and read states.
- Assign task-level roles and manage who can view or update tasks.
- See activity and progress summaries, including upcoming tasks, task status, priority, productivity, team load, and project completion.

### Messaging and calls

- Start direct messages and create group conversations within a workspace.
- Send messages, attach media, reply, forward messages, add emoji reactions, and manage read states.
- Pin messages, mute conversations, and manage group members, roles, and conversation permissions.
- Start and join calls from conversations, with browser-based audio/video calling using WebRTC signaling.
- Receive notifications for workspace, project, task, and conversation activity; view and manage invitations and notification read states.

### Profiles and preferences

- Sign up, sign in, complete onboarding, and reset a password through the authentication flows.
- Edit a profile, username, avatar, and appearance; choose a theme and notification preferences.
- Configure presence options such as Do Not Disturb and audio level.
- Manage account security options, including the two-factor setting exposed by the application.

### FlowSpace

- Enter a Phaser-powered, project-linked virtual space.
- Navigate the space with an on-screen character, see remote participants, and interact with doors that connect spaces.
- Use the realtime channel and WebRTC call functionality integrated with the virtual-space experience.

### Interface and experience

- Responsive dashboard navigation with workspace and project sidebars, global search, notifications, and profile areas.
- Light/dark theme support, reusable dialogs and confirmation prompts, and toast feedback.

## Technology stack

| Area                                  | Technologies                                                   |
| ------------------------------------- | -------------------------------------------------------------- |
| Web framework                         | Next.js 16 (App Router), React 19, TypeScript                  |
| Styling and UI                        | Tailwind CSS 4, styled-components, Framer Motion, Lucide icons |
| Client state and data                 | TanStack Query, Zustand, Axios                                 |
| Forms and validation                  | Zod                                                            |
| Database and ORM                      | PostgreSQL, Prisma 7                                           |
| Authentication, realtime, and storage | Supabase (`@supabase/ssr`, Supabase JS, Supabase Storage)      |
| Rich text and interactions            | Tiptap, dnd-kit, emoji-mart, Floating UI                       |
| Charts, dates, and utilities          | Recharts, date-fns, React Day Picker                           |
| Virtual space and calling             | Phaser 4, WebRTC                                               |
| Code quality                          | ESLint 9, TypeScript                                           |

## Getting started

### Prerequisites

- Node.js compatible with the installed Next.js version.
- npm (commands below use npm; the repository includes `package-lock.json`).
- A PostgreSQL database and a Supabase project configured for authentication, realtime, and storage.

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root. The project reads these values:

```dotenv
# Supabase project
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# PostgreSQL connections
# Used by Prisma CLI for schema and migration operations
DIRECT_URL=
# Used by the application Prisma client / PostgreSQL adapter
DIRECT_URL_POOLER=

# Base URL used to build invitation links
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Optional server-side API base URL (defaults to http://localhost:3000 in development)
BASE_URL=http://localhost:3000
```

Use the connection strings and keys from your own Supabase project. Keep the service-role key private; never commit `.env` or expose server-only secrets in client-side code. Supabase Storage must be configured for the buckets/paths used by the app.

### 3. Apply the database schema

The Prisma schema and migrations live in `prisma/`. With `DIRECT_URL` configured, apply the migrations:

```bash
npx prisma migrate deploy
```

For local schema development, use `npx prisma migrate dev`. Regenerate the Prisma client after schema changes with `npx prisma generate`.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available scripts

| Command         | Description                                         |
| --------------- | --------------------------------------------------- |
| `npm run dev`   | Start the Next.js development server using webpack. |
| `npm run build` | Create a production build.                          |
| `npm run start` | Serve the production build.                         |
| `npm run lint`  | Run ESLint.                                         |

## Project structure

```text
prisma/                 Prisma schema and database migrations
public/                 Static assets
src/app/                Next.js pages, layouts, and API route handlers
src/components/         Feature and shared UI components
src/FlowSpace/          Phaser scenes, characters, entities, and helpers
src/lib/db/             Prisma client setup
src/lib/queries/        Client data-fetching hooks
src/lib/serviceLayer/   Domain services and permission checks
src/lib/supabase/       Supabase browser, server, admin, and session clients
src/lib/webrtc/         WebRTC media, peer, and signaling helpers
```

## Data and access model

The Prisma schema models users, workspaces, workspace members and roles, projects, project members and roles, tasks, assignees, subtasks, attachments, comments, conversations, notifications, invitations, activities, calls, and FlowSpace doors. Authorization is enforced through workspace, project, task, and conversation role/permission logic in the service layer and API handlers.

## Deployment notes

Deploy as a standard Next.js application on a Node.js-compatible host. Configure the production Supabase URL and keys, PostgreSQL connection strings, and `NEXT_PUBLIC_BASE_URL` for the deployed origin. Apply committed Prisma migrations during your deployment workflow and configure Supabase Storage and authentication settings for the production project.

## License

No license file is currently included in this repository. Add a `LICENSE` file if you intend to distribute or reuse the project under specific terms.
