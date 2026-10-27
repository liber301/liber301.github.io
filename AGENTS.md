# liber personal blog

- This is a static personal blog for `liber301`, hosted at `https://liber301.github.io`.
- Write posts as Markdown in `content/posts/`, using existing front matter as a guide. Keep the author's public name `liber`.
- Keep personal biographical details grounded in the user's supplied facts. Starter tutorial articles are explicitly marked as examples.
- `scripts/build.mjs` generates `dist/`; do not hand-edit the generated output.
- Templates are in `src/templates.mjs`; styles and browser behavior are in `assets/`.
- Run `npm run build` and `npm run check` after changes. For visual changes, check desktop and mobile layouts in a browser.
- `npm run preview` serves the current build on loopback only. The deployment workflow builds and publishes to GitHub Pages on pushes to `main`.
