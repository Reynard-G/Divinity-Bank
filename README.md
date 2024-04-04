<p align="center">
<a href=https://github.com/Reynard-G/Divinity-Bank-Website target="_blank">
<img src='https://github.com/Reynard-G/Divinity-Bank-Website/assets/40525094/8c58c7f0-b743-469a-89d8-1bd495f70a40' width="100%" alt="Banner" />
</a>
</p>

<p align="center">
<img src="https://img.shields.io/github/languages/code-size/Reynard-G/Divinity-Bank-Website?style=flat-square" alt="GitHub code size in bytes" />
<img src="https://img.shields.io/github/last-commit/Reynard-G/Divinity-Bank-Website?style=flat-square" alt="GitHub last commit" />
<img src="https://img.shields.io/github/commit-activity/m/Reynard-G/Divinity-Bank-Website?style=flat-square" alt="GitHub commit activity month" />
<img src="https://img.shields.io/github/license/Reynard-G/Divinity-Bank-Website?style=flat-square" alt="License" />
</p>

## 🔍 Table of Contents

* [💻 Stack](#stack)

* [📝 Project Summary](#project-summary)

* [⚙️ Setting Up](#setting-up)

* [🚀 Run Locally](#run-locally)

* [📄 License](#license)

## 💻 Stack

- [react](https://reactjs.org/): Essential for building UI components and managing state.
- [next](https://nextjs.org/): Facilitates server-client communication, routing, and server-side rendering.
- [prisma/client](https://www.prisma.io/): ORM for data fetching and management.
- [swr](https://swr.vercel.app/): Handles data fetching, caching, and synchronization.
- [tailwindcss](https://tailwindcss.com/): Utility-first CSS framework for styling.
- [framer-motion](https://www.framer.com/motion/): Enables animations and transitions.
- [bcrypt](https://www.npmjs.com/package/bcrypt): Used for password hashing and encryption.
- [sentry/nextjs](https://docs.sentry.io/platforms/javascript/guides/nextjs/): Provides error tracking and monitoring for Next.js applications.

## 📝 Project Summary

- [**app**](app): Main application directory containing user-related functionalities.
- [**components**](components): Reusable UI components like buttons, cards, and tables.
- [**contexts**](contexts): Context providers for managing global state in the app.
- [**lib**](lib): Contains actions and utility functions for the project.
- [**prisma**](prisma): Directory related to database operations using Prisma.
- [**public**](public): Public assets and files for the application.
- [**utils**](utils): Utility functions and helpers for various tasks in the project.

## ⚙️ Setting Up

### Your Environment Variables

```env
JWT_SECRET=
DATABASE_URL=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=
```

## 🚀 Run Locally

1.Clone the Divinity-Bank-Website repository:

```sh
git clone https://github.com/Reynard-G/Divinity-Bank-Website
```

2.Install the dependencies with one of the package managers listed below:

```bash
pnpm install
bun install
npm install
yarn install
```

3.Start the development mode:

```bash
pnpm dev
bun dev
npm run dev
yarn dev
```

## 📄 License

This project is licensed under the **GNU General Public License v3.0** - see the [**GNU General Public License v3.0**](https://github.com/Reynard-G/Divinity-Bank-Website/blob/development/LICENSE.md) file for details.
