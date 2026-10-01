# Omega Internal Financial Calculators

Static calculator app for GitHub Pages. The app runs in the browser and does not save or transmit calculator inputs.

## Development

```sh
npm ci
npx vite --config vite.config.pages.ts
```

## Deployment

Pushes to `main` build and deploy the static app to GitHub Pages using `.github/workflows/pages.yml`.
