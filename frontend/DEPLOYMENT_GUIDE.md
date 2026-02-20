# How to Deploy FarmLyf

Since FarmLyf is a **Single Page Application (SPA)** built with React and Vite, deploying it is very easy. The User implementation (`/`) and Admin Dashboard (`/admin`) are part of the same project, so you only need to deploy this one codebase, and both will work automatically.

I have already added two configuration files to your project to make this smooth:
1. `vercel.json`: Configuration for Vercel.
2. `public/_redirects`: Configuration for Netlify.

These files ensure that when you refresh a page (like `/admin/dashboard`), it doesn't give a "404 Not Found" error.

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is the creators of Next.js and provides excellent support for Vite apps.

1.  **Create a GitHub Repository**:
    *   Go to [GitHub.com](https://github.com) and create a new repository (e.g., `farmlyf`).
    *   Push your code to this repository.
    *   *If you haven't pushed code before:*
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/YOUR_USERNAME/farmlyf.git
        git push -u origin main
        ```

2.  **Connect to Vercel**:
    *   Go to [Vercel.com](https://vercel.com) and Sign Up/Login.
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your `farmlyf` repository from GitHub.

3.  **Configure & Deploy**:
    *   Vercel will auto-detect "Vite".
    *   **Framework Preset**: Vite (should be auto-selected).
    *   **Root Directory**: `./` (default).
    *   Click **Deploy**.

4.  **Done!**
    *   You will get a URL like `https://farmlyf.vercel.app`.
    *   Open `https://farmlyf.vercel.app/` for the User site.
    *   Open `https://farmlyf.vercel.app/admin` for the Admin Dashboard.

---

## Option 2: Deploy to Netlify

1.  **Create a GitHub Repository** (same as above).
2.  **Connect to Netlify**:
    *   Go to [Netlify.com](https://netlify.com) and Sign Up/Login.
    *   Click **"Add new site"** -> **"Import an existing project"**.
    *   Connect to GitHub and select your `farmlyf` repo.
3.  **Configure**:
    *   **Build command**: `npm run build`
    *   **Publish directory**: `dist`
    *   Click **Deploy site**.

---

## How it works
Both the User Website and Admin Panel are just different **Routes** in your React Router (`src/App.jsx`).
- When a user visits `/`, React shows the User Layout.
- When a user visits `/admin`, React shows the Admin Layout.

You do NOT need to deploy them separately. One deployment handles everything!
