# liber personal blog

- This is the personal blog for `liber301`, stored at `/Users/mmmlq/codeProject/github_liber_com`.
- The production site is owner-private on Sites. Use `.openai/hosting.json` for its identity and `site.config.json` for its origin. Authentication and access control are enforced by the hosting platform with ChatGPT sign-in, including direct requests to articles, feeds and search assets. Do not replace this with a browser-only password form.
- Write posts as Markdown in `content/posts/`, using existing front matter as a guide. Keep the author's public name `liber`.
- Keep personal biographical details grounded in the user's supplied facts. Starter tutorial articles are explicitly marked as examples.
- `scripts/build.mjs` generates `dist/`; do not hand-edit the generated output.
- Templates are in `src/templates.mjs`; styles and browser behavior are in `assets/`.
- Run `npm run build` and `npm run check` after changes. For visual changes, check desktop and mobile layouts in a browser.
- `npm run preview` serves the current build on loopback only. Local preview does not add a login gate because it is only available on the user's own computer.
- `origin` remains the user's private GitHub source repository. Push source changes there separately from publishing the Sites version. The Sites source helper uses its own credential-provided remote without replacing `origin`.
- The legacy GitHub Pages publishing workflow is retired and must remain disabled. Do not re-enable the old public site or make either source or production content public without the user's explicit request.
