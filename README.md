# cosmos-ui

UI of the Cosmos Platform

## Run

Run locally with `bun run dev`.

The application needs the environment variable `NEXT_PUBLIC_SERVER_URL` to be present to run. It should contain the address of the server.

## Structure

```
cosmos-ui
├── src
│   ├── app                       // Next.js app directory
│   │   ├── (protected)           // Protected routes (requires auth)
│   │   │   ├── (admin)           // Admin-only routes
│   │   │   │   └── admin         // Backoffice pages
│   │   │   ├── applications      // Applications management
│   │   │   │   └── [name]        // Dynamic application detail page
│   │   │   ├── graphs            // Graph visualization pages
│   │   │   ├── groups            // Groups management
│   │   │   │   └── [name]        // Dynamic group detail page
│   │   │   └── tokens            // Token management
│   │   └── (public)              // Public routes (no auth required)
│   │       └── login             // Login page
│   │
│   ├── components                // React components
│   │   ├── auth                  // Authentication components
│   │   ├── backoffice            // Admin/backoffice components
│   │   ├── cards                 // Card components
│   │   ├── flow                  // Flow diagram components
│   │   ├── graphs                // Graph visualization components
│   │   ├── sidebar               // Sidebar and navigation components
│   │   ├── swagger               // Swagger/API documentation components
│   │   └── ui                    // Reusable UI components (shadcn/ui)
│   │
│   ├── lib                       // Shared utilities and logic
│   │   └── api                   // API client and fetch functions
│   │       ├── applications      // Application API endpoints
│   │       ├── auth              // Authentication API
│   │       ├── groups            // Groups API
│   │       ├── monitoring        // Monitoring API
│   │       ├── teams             // Teams API
│   │       ├── token             // Token API
│   │       └── users             // Users API
│   │
│   ├── config                    // Configuration files
│   └── hooks                     // Custom React hooks
│
└── components.json               // shadcn/ui configuration
```
