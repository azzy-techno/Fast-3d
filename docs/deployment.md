# Deployment

Live site: https://azzy-techno.github.io/Fast-3d/

GitHub Pages is configured with **GitHub Actions** as the source. `.github/workflows/deploy-pages.yml`
runs on every push to `main` (and on manual dispatch): it installs the locked dependencies, runs
`npm run build` with `BASE_PATH=/<repository name>/` and publishes `dist/`.

- Settings: https://github.com/azzy-techno/Fast-3d/settings/pages
- Workflow: https://github.com/azzy-techno/Fast-3d/actions/workflows/deploy-pages.yml

All asset URLs go through Vite's base path, so the same build works under a project path or, built
without `BASE_PATH`, at a domain root. No runtime API keys, CDNs or external requests are involved.

The baked 3D assets in `public/` are committed, so the workflow does not need Blender. Re-bake locally
(see the README) only when a scene script changes.

## Before publishing

```powershell
$env:BASE_PATH='/Fast-3d/'; npm run build
node tools/serve.mjs dist 4173 /Fast-3d/
npm test
```

`tools/serve.mjs` gzips the same file types GitHub Pages does (including `.glb`), so transfer sizes
measured locally match the published site closely.
