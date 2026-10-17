# Public deployment

Live site: https://azzy-techno.github.io/Fast-3d/

The exterior update in commit `27710a4` was published on 17 October 2026. The [deployment workflow](https://github.com/azzy-techno/Fast-3d/actions/runs/39016666990) completed successfully. The public homepage returned HTTP 200 and referenced the current build's JavaScript bundle; both new exterior assets returned HTTP 200 with checksums matching the tested local files.

## Future updates

GitHub Pages is enabled with **GitHub Actions** as the source. Pushes to `main` automatically build and publish the homepage. To redeploy manually, open **Actions → Deploy FAST homepage → Run workflow** on `main`.

- Settings: https://github.com/azzy-techno/Fast-3d/settings/pages
- Workflow: https://github.com/azzy-techno/Fast-3d/actions/workflows/deploy-pages.yml

The workflow installs locked dependencies, builds the Vite application and publishes only `dist/` using GitHub's Pages artifact mechanism. No hosting API key is embedded in the application.

All local asset references honor Vite's base path, including the loader images, logo texture, audio, character model and HDR lighting map. Validate the project-path build with:

```bash
BASE_PATH=/Fast-3d/ npm run build
BASE_PATH=/Fast-3d/ npm run test:browser
```

For a domain-root static host, run `npm run build` without `BASE_PATH` and upload `dist/`.

## Cloud access

GitHub API and public-site access were verified in this session. Future cloud environments need `api.github.com` and `azzy-techno.github.io` in their allowed network destinations, in addition to the package/Git access required for setup. These domains were previously saved in the environment configuration draft. Live development-server processes must still be restarted in each new environment.
