# liber personal blog

- This is liber301's personal blog at `/Users/mmmlq/codeProject/github_liber_com`, published at `https://liber301.github.io/` with GitHub Pages.
- The user explicitly chose public GitHub Pages with a browser-only username/password login screen. Preserve that choice; do not migrate hosting or introduce platform accounts without a new request. This UI gate does not make source, posts, RSS or static assets confidential.
- Login settings are in `login.config.json`. Use `npm run set-password` to update the account and password hash. Never commit `.local/`, which contains initial plaintext login details.
- Write posts as Markdown in `content/posts/`, following existing front matter. Keep the author's name `liber`; do not invent biographical facts. Starter tutorials are marked as examples.
- `scripts/build.mjs` generates `dist/`; edit templates, assets and content rather than generated output.
- Run `npm run build` and `npm run check` after changes. Check desktop and mobile layouts for visual changes, and login, logout and direct article navigation for login changes.
- `npm run preview` serves the current build on loopback. Local preview includes the same browser-only login screen.
- `origin` is `liber301/liber301.github.io`. Pushing main triggers `.github/workflows/deploy.yml` to publish GitHub Pages. Do not replace this remote or reintroduce the retired private Sites deployment.
