# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
npx sv@0.15.3 create --template minimal --types ts --add prettier eslint tailwindcss="plugins:none" --no-download-check --install npm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Environment

This app requires a Gemini API key:

- `GEMINI_API_KEY`: Google Generative AI API key for the `/api/verbosify` route.
- `GEMINI_MODEL` (optional): Override the model name (default: `models/gemini-flash-lite-latest`).

If the API is rate-limited or the quota is exceeded, the server responds with HTTP `429` and a `Retry-After` header to indicate when to retry.

### List available models (curl)

Use your API key to list accessible models and pick a free-tier one:

```sh
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | jq -r '.models[].name'
```

If you don’t have `jq`, you can view the raw JSON:

```sh
curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY"
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

## Deploying to Cloudflare Pages

This project uses the Cloudflare adapter, so Pages is a good fit (server routes run as Pages Functions).

1. Push the repo to GitHub.
2. In Cloudflare Pages, create a new project from the repo.
3. Set build settings:

	- Build command: `npm run build`
	- Build output directory: `.svelte-kit/cloudflare`

4. Add environment variables in Pages settings:

	- `GEMINI_API_KEY`
	- `GEMINI_MODEL` (optional)

5. Deploy.
