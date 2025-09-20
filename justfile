# https://github.com/casey/just
# https://just.systems/

dev:
    npm run dev -- --port 4001

dev-with-proxy:
    API_TARGET=https://admin.peterbe.com npm run dev -- --port 4001

dev-for-testing:
    NODE_ENV=test npm run dev -- --port 4001

build:
    npm run build

start: build
    npm run preview -- --port 4001

start-with-proxy: build
    API_TARGET=https://admin.peterbe.com npm run preview -- --port 4001

start-for-testing:
    NODE_ENV=test npm run build
    NODE_ENV=test npm run preview -- --port 3000

tsc:
    npm run tsc

lint:
    npm run lint
    npm run tsc

lintfix:
    npm run lint:fix

prettyfix:
    npm run pretty:fix

format: lintfix

install:
    npm install

outdated:
    npx npm-check-updates --interactive

run-for-playwright:
    NODE_ENV=test npm run build
    PORT=3000 NODE_ENV=test npm run serve

test-playwright:
    curl -s http://localhost:3000 > /dev/null
    PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test

playwright-codegen:
    npx playwright codegen

test-manifest:
    npm run test-manifest -- http://localhost:3000

test: test-playwright test-manifest

upgrade:
     npx npm-check-updates --interactive
