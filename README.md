# cosmos-ui

UI of the Cosmos Platform

Run with `bun dev`

# Dependencies

- `Zod`: Used validate types.

# Structure

cosmos-ui/
│
├── public/                # Static files like images, icons, etc.
├── styles/                # Global CSS/SCSS styles
│
├── src/app/               # Main application pages
│   ├── admin/             # Backoffice pages (/admin/*)
│   └── page.tsx           # Entry for main application 
│
├── components/           # Shared React components
│   ├── layout/            # Layout components like Header, Sidebar, etc.
│   └── ui/                # Reusable UI components (buttons, inputs, etc.)
│
├── lib/                  # Shared utilities and logic
│   ├── api/               # API client wrapper, fetch functions
│   ├── dtos/              # TypeScript interfaces/types for API data
│   ├── constants.ts       # Global constants
│   └── helpers.ts         # Utility functions
│
├── middleware.ts         # Middleware for auth, logging, etc.
├── next.config.js        # Next.js config
├── tsconfig.json         # TypeScript config
└── package.json