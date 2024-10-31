# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev -- --port 4001

dev-for-testing:
    NODE_ENV=test npm run dev -- --port 4001

build:
    npm run build

start: build
    npm run preview -- --port 4001

start-for-testing:
    NODE_ENV=test npm run build
    NODE_ENV=test npm run preview -- --port 4001

pretty:
    npm run pretty

tsc:
    npm run tsc

lint: pretty
    npm run lint
    npm run tsc

lintfix: prettyfix
    npm run lint:fix

prettyfix:
    npm run pretty:fix

format: prettyfix lintfix

install:
    npm install

outdated:
    npx npm-check-updates --interactive

test-playwright:
    curl -s http://localhost:4001 > /dev/null
    PLAYWRIGHT_BASE_URL=http://localhost:4001 npx playwright test

test-manifest:
    npm run test-manifest -- http://localhost:4001

test: test-playwright test-manifest
