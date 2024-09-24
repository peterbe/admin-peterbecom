import { expect, test } from "@playwright/test";

// test("search and find and edit hello-world blogitem", async ({ page }) => {
//   await page.goto("/");
//   await expect(page).toHaveTitle(/Sign in/);
//   await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click();
//   await page
//     .getByRole("banner")
//     .getByRole("link", { name: "Blogitems" })
//     .click();

//   await expect(page).toHaveTitle(/Blogitems/);

//   await page.getByPlaceholder("Search").click();
//   await page.getByPlaceholder("Search").fill("xxx");
//   await page.getByPlaceholder("Search").press("Enter");
//   await page.getByRole("button", { name: "Clear" }).click();
//   await page.getByPlaceholder("Search").fill("hello");
//   await page.getByPlaceholder("Search").press("Enter");
//   await page.getByRole("link", { name: "Hello World" }).click();
//   await expect(page).toHaveTitle(/Edit hello-world/);

//   await page.getByRole("button", { name: "Edit" }).click();
//   await page.getByPlaceholder("Title").click();
//   await page.getByPlaceholder("Title").fill("Hello World Playwrightwashere");
//   await page.getByRole("button", { name: "Save" }).click();
//   await page.getByRole("link", { name: "Blogitems" }).click();
//   await page.getByRole("link", { name: "Hello World" }).click();
//   await page.getByPlaceholder("Title").click();
// });

test("add, find, edit blogitem", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Sign in/);
  await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click();

  await page.getByRole("link", { name: "Add blogitem" }).click();
  await page.getByPlaceholder("Title").click();
  await page.getByPlaceholder("Title").fill("Hello World!");
  await page.getByLabel("Text *").click();
  await page.getByLabel("Text *").fill("Hello!");
  await expect(page.getByTestId("preview")).toHaveText("Hello world");
  await page.getByText("Hello world").click();
  await page.getByLabel("Summary").click();
  await page.getByLabel("Summary").fill("This is the summary");
  await page.getByLabel("URL").click();
  await page.getByLabel("URL").fill(" https://www.peterbe.com ");
  await page
    .locator("div")
    .filter({ hasText: /^Categories$/ })
    .locator("div")
    .nth(1)
    .click();
  await page.getByText("Hardware").click();
  await page.getByText("Software").click();
  await page.getByLabel("Keywords").click();
  await page.getByLabel("Keywords").fill("one\n\n two \n  ");

  const button = page.getByRole("button", { name: "Save" });
  const isDisabled = await button.evaluate(
    (button: HTMLButtonElement) => button.disabled,
  );
  expect(isDisabled).toBe(false);

  await button.click();
  // XXX WHY DO YOU HAVE TO CLICK IT TWICE?!
  await button.click();

  // await expect(page).toHaveURL(/\/plog\/hello-world$/);
  await expect(page).toHaveURL("/plog/hello-world");
  await expect(page).toHaveTitle(/Edit hello-world/);

  await page
    .getByRole("banner")
    .getByRole("link", { name: "Blogitems" })
    .click();
  await expect(page).toHaveURL("/plog");

  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill("xxx");
  await page.getByPlaceholder("Search").press("Enter");
  await page.getByRole("button", { name: "Clear" }).click();
  await page.getByPlaceholder("Search").fill("hello");
  await page.getByPlaceholder("Search").press("Enter");
  await page.getByRole("link", { name: "Hello World" }).click();
  await expect(page).toHaveTitle(/Edit hello-world/);

  await page.getByPlaceholder("oid slug").fill("hello-new-world");
  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL("/plog/hello-new-world");
  await expect(page).toHaveTitle(/Edit hello-new-world/);
});

// test("get started link", async ({ page }) => {
//   await page.goto("https://playwright.dev/");

//   // Click the get started link.
//   await page.getByRole("link", { name: "Get started" }).click();

//   // Expects page to have a heading with the name of Installation.
//   await expect(
//     page.getByRole("heading", { name: "Installation" })
//   ).toBeVisible();
// });
