# FuClaude Pool Manager UI

<div align="center">

[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](./LICENSE)
[![Version](https://img.shields.io/badge/Version-0.1.1-blue?style=for-the-badge)](https://github.com/f14XuanLv/fuclaude-pool-manager-ui)

</div>

This is a frontend web application designed to interact with the [FuClaude Pool Manager](https://github.com/f14XuanLv/fuclaude-pool-manager) Cloudflare Worker backend.

It provides a user-friendly interface for both end-users to log in to Claude instances and for administrators to manage the pool of accounts.

- **Backend Project**: [https://github.com/f14XuanLv/fuclaude-pool-manager](https://github.com/f14XuanLv/fuclaude-pool-manager)

This project is built with React and TypeScript, structured for use with [Vite](https://vitejs.dev/) as the build tool.

## Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Ff14XuanLv%2Ffuclaude-pool-manager-ui&env=VITE_WORKER_URL&envDescription=Enter%20your%20FuClaude%20Pool%20Manager%20Worker%20URL%20(e.g.,%20https%3A%2F%2Fname.account.workers.dev)&project-name=fuclaude-pool-ui&repository-name=fuclaude-pool-manager-ui)

**Important:** When deploying with Vercel, you will be prompted to enter the `VITE_WORKER_URL` environment variable during the setup process.

Use the following template for the `VITE_WORKER_URL` value: `https://<your-worker-name>.<your-account-id>.workers.dev`

## Features

*   **User Interface:**
    *   **Random Login:** Allows users to quickly get a login URL using a randomly selected account from the pool.
    *   **Specific Account Login:** Lists available email accounts. Users can select an account and provide a unique session identifier to log in.
    *   **Token Expiration:** Users can specify a desired token expiration time in seconds when logging in.
    *   Random session identifier generation if left blank.
*   **Admin Interface (`/admin` path):**
    *   Password protected.
    *   **Account Listing:** View all configured email accounts and previews of their session keys (SKs). List automatically refreshes after add/update/delete/batch actions.
    *   **Add Account:** Add new email-SK pairs to the pool.
    *   **Update Account:** Modify existing email addresses or update their SKs.
    *   **Delete Account:** Remove accounts from the pool.
    *   **Batch Operations:** Perform bulk additions or deletions of accounts using a JSON input.
*   **Configurable Worker URL:**
    *   The application needs the URL of your deployed FuClaude Pool Manager worker. This can be configured in multiple ways (see "Configuring Worker URL" section below).
    *   Configuration UI accessible via a gear icon (⚙️) in the header.
*   **Responsive Design:** Adapts to various screen sizes.
*   **User Feedback:** Loading indicators and toast notifications for API interactions.
*   **Theme:** Light, creamy-white theme with orange accents.

## Prerequisites

*   A modern web browser.
*   Node.js and npm/yarn (for development/building).
*   A deployed instance of the [FuClaude Pool Manager](https://github.com/f14XuanLv/fuclaude-pool-manager) Cloudflare Worker.

## Getting Started (Development with Vite)

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url> # Replace <repository-url> with this project's URL
    cd <repository-directory>
    ```
2.  **Install Dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
    Ensure `vite` is installed as a dev dependency.
3.  **Configure Worker URL (Development):**
    *   The easiest way for local development is to create a `.env.local` file in the project root:
        ```env
        VITE_WORKER_URL=http://localhost:8787
        ```
        Replace the URL with your actual development worker URL. Vite will automatically pick this up.
    *   Alternatively, you can configure it via the UI after starting the app.

4.  **Run Development Server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    This will start the Vite development server, typically at `http://localhost:5173`.

5.  **TypeScript & Vite Types Note:**
    *   This project uses `/// <reference types="vite/client" />` in `src/vite-env.d.ts` for Vite-specific type definitions like `import.meta.env`.
    *   If you encounter TypeScript errors related to this (e.g., "Cannot find type definition file for 'vite/client'"), ensure:
        1.  `vite` is correctly installed as a development dependency in your `package.json`.
        2.  Your `tsconfig.json` in the project root is properly configured. A typical `compilerOptions.types` array might include `"vite/client"`, or it might be picked up automatically if `typeRoots` are standard. If you have custom `types` or `typeRoots` in `tsconfig.json`, ensure they don't exclude Vite's types.

## Building for Production (with Vite)

1.  **Ensure `VITE_WORKER_URL` is set** in your environment if you want to bake it into the build (e.g., in your CI/CD pipeline or deployment platform's build settings).
2.  **Run the Build Command:**
    ```bash
    npm run build
    # or
    yarn build
    ```
    This will generate optimized static assets in the `dist` folder.

## Deployment

Deploy the contents of the `dist` folder (after running `npm run build`) to any static web hosting service that can serve Single Page Applications (SPAs), such as Cloudflare Pages, Vercel, Netlify, or Azure Static Web Apps.

**Configure `VITE_WORKER_URL` on your hosting platform for the deployed application (see Quick Deploy section or platform-specific documentation).**

## Configuring Worker URL (Details)

The application determines the `WORKER_URL` in the following order of precedence:

1.  **User Configuration (via UI):** If you set the URL using the gear icon (⚙️) in the UI, this value is saved in your browser's `localStorage` and used subsequently.
2.  **Vite Environment Variable (Recommended for Deployment & Development):**
    *   Set an environment variable named `VITE_WORKER_URL` in your development environment (e.g., in a `.env.local` file) or in your deployment platform's settings.
    *   Example: `VITE_WORKER_URL=https://your-actual-worker.workers.dev`.
    *   Vite will embed this value into the application during the build process (for production builds) or make it available in `import.meta.env` (for development).
3.  **Deployment-Time Configuration (via `index.html` - Alternative Fallback):**
    *   The `index.html` file includes a script:
        ```html
        <script>
          window.__PRECONFIGURED_WORKER_URL__ = "%%PLACEHOLDER_WORKER_URL%%";
        </script>
        ```
    *   A custom deployment process (if not using Vite's env vars) could replace `"%%PLACEHOLDER_WORKER_URL%%"` with your actual worker URL string. This is less common with Vite projects.
4.  **Example URL (Final Fallback):** If none of the above methods provide a URL, the application will use a non-functional example URL: `https://<your-worker-name>.<your-account-id>.workers.dev`. You will then need to configure it via the UI.

## Usage

*   **User View (Default):**
    *   Access the application by navigating to its root URL.
    *   Use the "Random Login" button or select a specific email account.
*   **Admin View:**
    *   Navigate to the `/admin` path of your frontend's URL.
    *   Enter your admin password. The admin password for API calls is now included by each admin action component directly in the request payload.

## Project Structure (Key Files)

*   `index.html`: The main HTML entry point.
*   `src/main.tsx`: The main React/TypeScript application entry point (renders the App).
*   `src/App.tsx`: The root application component (layout, routing, context providers).
*   `src/components/`: Reusable UI components.
*   `src/views/`: Page-level view components.
*   `src/hooks/`: Custom React hooks.
*   `src/contexts/`: React context for global state.
*   `src/types/`: TypeScript type definitions.
*   `vite.config.ts` (if you customize Vite): Vite configuration file.
*   `index.css`: Global styles.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
Created by f14xuanlv