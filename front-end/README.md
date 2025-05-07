This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.


# Next.js Front‑End Documentation

This repository contains a simple Next.js front‑end for a Task Manager application. It provides:

* A landing page with hero and features (uses `layout.tsx` and `page.tsx`)citeturn6file0turn6file1
* A CRUD interface for tasks: list, create, delete (in `tasks/page.tsx`)citeturn6file2
* A dynamic detail/edit page for individual tasks (`tasks/[id]/page.tsx`)citeturn6file3

---

## Table of Contents

* [Prerequisites](#prerequisites)
* [Getting Started](#getting-started)
* [Configuration](#configuration)
* [Project Structure](#project-structure)
* [Key Components](#key-components)
* [Pages](#pages)
* [Styling](#styling)
* [API Integration](#api-integration)
* [Scripts](#scripts)
* [Deployment](#deployment)
* [License](#license)

---

## Prerequisites

* Node.js v16+ and npm or Yarn
* Next.js v13+

---

## Getting Started

1. **Clone the repo**

   ```bash
   git clone <repo-url>
   cd <repo-folder>
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**

   * Create a `.env.local` file in project root.
   * Define your API base URL:

     ```dotenv
     NEXT_PUBLIC_API_URL=https://<api-id>.execute-api.<region>.amazonaws.com/v1
     ```

4. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## Configuration

| Key                   | Description              | Example          |
| --------------------- | ------------------------ | ---------------- |
| `NEXT_PUBLIC_API_URL` | Base URL for backend API | `https://.../v1` |

---

## Project Structure

```
/                  Root
├─ public/          Static assets (SVGs, images)
├─ components/      Shared React components (e.g., Navbar)
├─ app/             Next.js App Router
│  ├─ layout.tsx    Root layout (imports font and global CSS)citeturn6file0
│  ├─ page.tsx      Landing page with hero & featuresciteturn6file1
│  ├─ tasks/        Task management pages
│  │  ├─ page.tsx           List & create tasksciteturn6file2
│  │  └─ [id]/
│  │     └─ page.tsx        Detail & edit taskciteturn6file3
├─ styles/         Global and module CSS
├─ .env.local      Environment variables
├─ next.config.js  Next.js configuration
└─ package.json    Node.js scripts & dependencies
```

---

## Key Components

### `Navbar`

A reusable navigation bar component imported in all pages. Adjust links and branding in `components/Navbar.tsx`.

### `Layout` (`layout.tsx`)

Defines the HTML `<html>` & `<body>` wrappers, imports Google font Inter and global CSS. Ensures consistent styling across pages.citeturn6file0

---

## Pages

### Landing Page (`app/page.tsx`)

* Hero section with title, subtitle, and “Get Started” button.
* Features grid highlighting core functionality.
* Uses Tailwind CSS for responsive design.citeturn6file1

### Task List & Create (`app/tasks/page.tsx`)

* Fetches tasks from `${NEXT_PUBLIC_API_URL}/get_function` on mount.
* Form to add new tasks (POST to `/post_function`).
* Displays tasks in a grid with Delete and Detail buttons.citeturn6file2

### Task Detail & Edit (`app/tasks/[id]/page.tsx`)

* Reads `id` from URL using `useParams`.
* GETs task from `/get_by_id/{id}` on load.
* Form prefilled with existing values, PUT to `/put_function` on submit.
* Displays loading and updating states.citeturn6file3

---

## Styling

* Tailwind CSS utility classes used throughout.
* Global styles in `globals.css`.
* Responsive design with grid layouts and breakpoints.

---

## API Integration

All data interactions point to the back‑end via fetch calls. Endpoints:

| Action         | Method | Path               |
| -------------- | ------ | ------------------ |
| List tasks     | GET    | `/get_function`    |
| Get task by ID | GET    | `/get_by_id/{id}`  |
| Create task    | POST   | `/post_function`   |
| Update task    | PUT    | `/put_function`    |
| Delete task    | DELETE | `/delete_function` |

---

## Scripts

* `dev` – Runs dev server (`npm run dev`)
* `build` – Builds production app (`npm run build`)
* `start` – Runs production build (`npm run start`)

---

## License

MIT © Your Company
