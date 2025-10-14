# https://github.com/casey/just
# https://just.systems/

dev:
    bun run dev -- --port 4001

dev-with-proxy:
    API_TARGET=https://admin.peterbe.com bun run dev -- --port 4001

dev-for-testing:
    NODE_ENV=test bun run dev -- --port 4001

build:
    bun run build

start: build
    bun  run preview -- --port 4001

start-with-proxy: build
    API_TARGET=https://admin.peterbe.com bun run preview -- --port 4001

start-for-testing:
    NODE_ENV=test bun run build
    NODE_ENV=test bun run preview -- --port 3000

tsc:
    bun run tsc

lint:
    bun run lint
    bun run tsc

lintfix:
    bun run lint:fix

format: lintfix

install:
    bun install

outdated:
    bun outdated

test-playwright:
    curl -s http://localhost:3000 > /dev/null
    PLAYWRIGHT_BASE_URL=http://localhost:3000 bunx playwright test

playwright-codegen:
    bunx playwright codegen

test-manifest:
    bun run test-manifest -- http://localhost:3000

test: test-playwright test-manifest

upgrade:
    bun update --interactive
