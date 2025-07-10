# admin-peterbecom

The front-end for the back-end of [www.peterbe.com](https://www.peterbe.com).

## Playwright

In one terminal:

```bash
NODE_ENV=test npm run build
NODE_ENV=test npm run preview -- --port 4001
```

(Note, this is the same as `just start-for-testing`)

Then, in another terminal:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:4001 npx playwright test
```

Start codegen:

```bash
npx playwright codegen
```

