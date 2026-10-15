# Public deployment

The deployment target is GitHub Pages in the existing `azzy-techno/Fast-3d` repository. The expected site address is:

https://azzy-techno.github.io/Fast-3d/

This address becomes live only after GitHub Pages is enabled and the deployment workflow succeeds. It is not a verified live URL yet.

The homepage and workflow were pushed to `main` in commit `8bbb5d4`. The [first workflow run](https://github.com/azzy-techno/Fast-3d/actions/runs/38699993652) successfully installed dependencies, built the site and uploaded the Pages artifact. Publication failed at **Configure GitHub Pages** with `Get Pages site failed` / `Not Found`: Pages must be enabled with GitHub Actions as its source. The complete local browser suite passed against the `/Fast-3d/` production build, including all 11 scenes, navigation, audio, Arabic, responsive layouts and accessibility checks.

## Enable the site

In the repository, open **Settings → Pages → Build and deployment → Source**, and choose **GitHub Actions**. Then open **Actions → Deploy FAST homepage → Run workflow** on `main`. Subsequent pushes to `main` automatically rebuild and publish the site.

- Settings: https://github.com/azzy-techno/Fast-3d/settings/pages
- Workflow: https://github.com/azzy-techno/Fast-3d/actions/workflows/deploy-pages.yml

The workflow installs the lockfile, builds the static Vite application and deploys only `dist/` using GitHub's Pages artifact mechanism. It uses the repository's automatic workflow token; no hosting API key is embedded in the application. GitHub Pages availability for private repositories depends on the repository owner's GitHub plan.

All asset references honor Vite's base path, including the loading images, 3D logo texture and sound file. To validate the exact project-path build locally:

```bash
BASE_PATH=/Fast-3d/ npm run build
BASE_PATH=/Fast-3d/ npm run test:browser
```

For a domain-root deployment on another static host, use `npm run build` with no `BASE_PATH` and upload `dist/`.

## Cloud access

The current cloud network denied access to GitHub's API, so repository Pages settings and deployment status could not be inspected or changed through the API. The cloud configuration draft requests `api.github.com` for managing/checking Pages and `azzy-techno.github.io` for verifying the deployed site, preserving the existing allowlist. Saving that draft does not apply the network settings; review/save and publish the environment to apply them.
