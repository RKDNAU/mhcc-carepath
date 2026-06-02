# SWA with Supabase — Project Template

## What this template gives you

This template sets up a fully deployable web application with a live database, Microsoft login (via Entra ID / Azure AD), and an automated deployment pipeline. When you create a new project from it, every push to the `main` branch automatically builds and publishes the site to Azure. Pull requests automatically get a temporary preview URL so you can review changes before they go live. No infrastructure knowledge or command-line experience is required to get started — just follow the checklist below.

---

## Prerequisites

Before starting, confirm you have the following access. If you are missing any item, speak to Sean.

| What you need | Why you need it |
|---|---|---|
| Membership in the GitHub organisation | To create repos and store deployment secrets |
| Access to an Azure subscription | To create the Static Web App and Entra ID app registration |
| Membership in the Supabase organisation | To create a new Supabase project under the shared org account |
| Permission to create Entra ID app registrations | To enable Microsoft login for the app |

---

## New project checklist

Work through these steps in order. Each step is a single action.

**1. Create a new repository from this template**

Go to this template repository on GitHub. Click the green **Use this template** button, then choose **Create a new repository**. Set the owner to your GitHub organisation (not your personal account). Name the repo `project-[name]` where `[name]` describes your project (e.g. `project-client-portal`). Set visibility to **Private**. Click **Create repository**.

**2. Create a new Supabase project**

Go to [supabase.com](https://supabase.com) and sign in. In the top-left dropdown, make sure you have selected your organisation account — not your personal account. Click **New project**. Give the project a name that matches your GitHub repo (e.g. `project-client-portal`). Choose a strong database password and store it in your password manager. Select the region closest to your users. Click **Create new project** and wait for it to finish provisioning (about 2 minutes).

**3. Copy your Supabase URL and anon key**

In your new Supabase project, go to **Project Settings** (cog icon in the left sidebar) then **API**. Copy the **Project URL** and the **anon / public** key. Keep these handy — you will need them in the next step.

**4. Add Supabase secrets to GitHub**

In your new GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**. Click **New repository secret** and add the following two secrets one at a time:

| Secret name | Value to paste |
|---|---|
| `VITE_SUPABASE_URL` | The Project URL you copied from Supabase |
| `VITE_SUPABASE_ANON_KEY` | The anon / public key you copied from Supabase |

**5. Create an Entra ID app registration**

Go to the [Azure Portal](https://portal.azure.com). In the search bar at the top, search for **Entra ID** and open it. In the left sidebar click **App registrations**, then **New registration**. Give it the same name as your project. Leave the supported account types as the default (single tenant). You do not need to set a redirect URI yet — you will do that in step 6b. Click **Register**.

On the app registration overview page, copy the **Application (client) ID** and keep it handy.

Now create a client secret: in the left sidebar click **Certificates & secrets** > **New client secret**. Give it a description (e.g. the project name) and set an expiry (12 or 24 months). Click **Add**. Copy the **Value** immediately — it will be hidden after you leave this page. Store it securely.

**6. Create an Azure Static Web App**

Go to the [Azure Portal](https://portal.azure.com). Click **Create a resource**, search for **Static Web App**, and click **Create**.

Fill in the form:
- Subscription and resource group: use your organisation's standard ones (ask [Your Azure subscription owner] if unsure)
- Name: match your project name
- Plan type: Free or Standard depending on your needs
- Region: choose the region closest to your users
- Source: **GitHub** — sign in and select your organisation, your new repository, and the `main` branch
- Build presets: **Custom**
- App location: `/src`
- Api location: `/api`
- Output location: leave blank

Click **Review + create**, then **Create**. When deployment finishes, go to the resource and copy the **URL** (it will look like `https://your-app.azurestaticapps.net`). Also go to **Manage deployment token** and copy the token value.

**6b. Link the Entra app to your SWA URL**

Go back to your Entra ID app registration. In the left sidebar click **Authentication** > **Add a platform** > **Web**. In the **Redirect URIs** field enter:

```
https://your-app.azurestaticapps.net/.auth/login/aad/callback
```

Replace `your-app` with the actual subdomain from your SWA URL. Click **Configure**, then **Save**.

**6c. Add your Tenant ID to the app configuration file**

In your GitHub repository, open the file `staticwebapp.config.json`. Find the text `YOUR_TENANT_ID` and replace it with your actual Directory (tenant) ID.

To find your tenant ID: in the Azure Portal, go to **Entra ID** > **Overview**. The **Directory (tenant) ID** is shown on that page. Copy it and use it to replace `YOUR_TENANT_ID` in the file. Commit the change to `main`.

**7. Add the remaining secrets to GitHub**

Go back to your GitHub repository **Settings** > **Secrets and variables** > **Actions** and add these three secrets:

| Secret name | Value to paste |
|---|---|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | The deployment token copied from your Static Web App |
| `AAD_CLIENT_ID` | The Application (client) ID copied from your Entra app registration |
| `AAD_CLIENT_SECRET` | The client secret Value copied from your Entra app registration |

**8. Trigger the first deployment**

Push any commit to the `main` branch. If you made the `staticwebapp.config.json` edit in step 6c, that commit will do. Otherwise, edit any file (e.g. add a blank line to the README) and push.

Go to the **Actions** tab in your GitHub repository and watch the workflow run. A green tick means the deployment succeeded.

**9. Confirm the app is working**

Visit your SWA URL (e.g. `https://your-app.azurestaticapps.net`). You should be redirected to a Microsoft login prompt. Sign in with your Microsoft / work account. After login, you should see the dashboard page with a "Connected" status indicator.

If you see an error at this step, check the [Getting help](#getting-help) section below.

---

## Day-to-day development

### Working locally

1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli). On Windows, the easiest way is via `winget install Supabase.CLI` or by downloading the installer from the releases page.
2. In your project folder, run `supabase start`. This starts a local copy of the database on your machine.
3. Copy the file `.env.example` to a new file called `.env` in the same folder.
4. Open `.env` and fill in the values. Use the local Supabase URL and anon key that `supabase start` printed to the screen (not the production ones).
5. Open `src/pages/index.html` directly in your browser, or run your preferred local dev server.

Your local changes will not affect the live site until you push to `main`.

### Deploying to production

Push your changes to the `main` branch. The GitHub Actions workflow runs automatically and publishes the updated site. You can watch progress under the **Actions** tab in GitHub.

### Previewing a change before it goes live

Open a pull request targeting `main`. The deployment workflow will automatically build your changes and post a comment on the pull request with a temporary preview URL. The preview environment is automatically cleaned up when the pull request is closed or merged.

---

## Schema changes (database structure)

Never edit the production database directly through the Supabase dashboard. All database changes must go through migration files so they are tracked, reviewed, and repeatable.

**To make a schema change:**

1. Create a new file inside the `supabase/migrations/` folder. The filename must start with a UTC timestamp in the format `YYYYMMDDHHMMSS` followed by a short description, for example: `20260115093000_add_projects_table.sql`.
2. Write your SQL changes in that file.
3. Test locally by running `supabase db reset` — this replays all migrations on your local database from scratch.
4. Commit the migration file, push to a branch, and open a pull request. Do not apply it to production until the PR is reviewed and merged.