# admin-peterbecom

The front-end for the back-end of [www.peterbe.com](https://www.peterbe.com).

## Playwright

In one terminal:

```bash
NODE_ENV=test bun run build
NODE_ENV=test bun run preview -- --port 4001
```

(Note, this is the same as `just start-for-testing`)

Then, in another terminal:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4001 bunx playwright test
```

Start codegen:

```bash
bunx playwright codegen
```

