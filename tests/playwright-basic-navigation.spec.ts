import { expect, test } from "@playwright/test"

test("add, find, edit blogitem", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Sign in/)
  await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click()

  await page
    .locator("header")
    .getByRole("link", { name: "Add blogitem" })
    .click()
  await page.getByPlaceholder("Title", { exact: true }).click()
  await page.getByPlaceholder("Title", { exact: true }).fill("Hello World!")
  await page.getByLabel("Text *").click()
  await page.getByLabel("Text *").fill("Hello!")
  await expect(page.getByTestId("preview")).toHaveText("Hello world")
  await page.getByText("Hello world").click()
  await page.getByLabel("Summary").click()
  await page.getByLabel("Summary").fill("This is the summary")
  await page.getByLabel("URL").click()
  await page.getByLabel("URL").fill(" https://www.peterbe.com ")
  await page.getByLabel("Keywords").click()
  await page.getByLabel("Keywords").fill("one\n\n two \n  ")
  await page
    .locator("div")
    .filter({ hasText: /^Categories$/ })
    .locator("div")
    .nth(1)
    .click()
  await page.getByText("Hardware").click()
  await page.getByText("Software").click()

  const button = page.getByRole("button", { name: "Save" })
  const isDisabled = await button.evaluate(
    (button: HTMLButtonElement) => button.disabled,
  )
  expect(isDisabled).toBe(false)

  await button.click()
  // XXX WHY DO YOU HAVE TO CLICK IT TWICE?!
  await button.click()

  await expect(page).toHaveURL("/plog/hello-world")
  await expect(page).toHaveTitle(/Edit hello-world/)

  await page
    .getByRole("banner")
    .getByRole("link", { name: "Blogitems" })
    .click()
  await expect(page).toHaveURL("/plog")

  await page.getByPlaceholder("Search", { exact: true }).click()
  await page.getByPlaceholder("Search", { exact: true }).fill("xxx")
  await page.getByPlaceholder("Search", { exact: true }).press("Enter")
  await page.getByRole("button", { name: "Clear" }).click()
  await page.getByPlaceholder("Search", { exact: true }).fill("hello")
  await page.getByPlaceholder("Search", { exact: true }).press("Enter")
  await page.getByRole("link", { name: "Hello World" }).click()
  await expect(page).toHaveTitle(/Edit hello-world/)

  await page.getByPlaceholder("oid slug").fill("hello-new-world")
  await page.getByRole("button", { name: "Save" }).click()

  await expect(page).toHaveURL("/plog/hello-new-world")
  await expect(page).toHaveTitle(/Edit hello-new-world/)

  await expect(page.getByText("Pageviews")).not.toBeVisible()
  // await expect(page.getByText("Not enough data to show a graph")).toBeVisible()

  await page.getByRole("link", { name: "Home" }).click()
  await page.getByPlaceholder("Search titles or OIDs").click()
  await page.getByPlaceholder("Search titles or OIDs").fill("hello")
  await page.getByPlaceholder("Search titles or OIDs").press("Enter")
  await page.getByRole("option", { name: "Hello World!" }).click()
})

test("approve and delete comments", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Sign in/)
  await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click()

  await page
    .locator("header")
    .getByRole("link", { name: "Comments (1)" })
    .click()

  await expect(page).toHaveURL("/plog/comments?only=unapproved")
  await expect(page).toHaveTitle("(1) Comment")
  await expect(page.getByText("Blabla")).toBeVisible()
  await expect(
    page.getByText("This has already been approved"),
  ).not.toBeVisible()

  await page.getByTestId("comments-filters").getByText("Unapproved").click()
  await expect(page).toHaveTitle("(1) Comment")
  await expect(page.getByText("Blabla")).toBeVisible()
  await expect(
    page.getByText("This has already been approved"),
  ).not.toBeVisible()

  await page.getByText("Autoapproved").click()
  await expect(page).toHaveTitle("(0) Comments")
  await expect(page.getByText("Blabla")).not.toBeVisible()
  await expect(
    page.getByText("This has already been approved"),
  ).not.toBeVisible()

  await page.getByText("Any").click()
  await expect(page).toHaveTitle("(2) Comments")
  await expect(page.getByText("Blabla")).toBeVisible()
  await expect(page.getByText("This has already been approved")).toBeVisible()
})

test("crud categories", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Sign in/)
  await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click()

  await page.getByRole("link", { name: "Categories" }).click()
  await page.getByRole("button", { name: "Edit" }).first().click()
  await page.getByLabel("Name").click()
  await page.getByLabel("Name").fill("Softwares")
  await page.getByRole("button", { name: "Save" }).click()

  await page.getByRole("button", { name: "Add new category" }).click()
  await page.getByLabel("Name").click()
  await page.getByLabel("Name").fill("New name")
  await page.getByRole("button", { name: "Save" }).click()

  await page.getByRole("button", { name: "Delete" }).nth(1).click()
  await page.getByRole("button", { name: "Cancel" }).click()
  await page.getByRole("button", { name: "Delete" }).nth(2).click()
  await page.getByRole("button", { name: "Are you sure?" }).click()
  await page.getByRole("button", { name: "Yes" }).click()
})

test("analytics query", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/Sign in/)
  await page.getByRole("link", { name: "Sign in with OpenID Connect" }).click()

  await page.getByRole("link", { name: "Analytics Query" }).click()
  await page.getByPlaceholder("select * from analytics order").click()
  await page
    .getByPlaceholder("select * from analytics order")
    .fill(
      "select type, count(type) as c from analytics group by type order by 2 desc;",
    )
  await page.keyboard.press("Meta+Enter")
  await page.getByRole("link", { name: "bar chart" }).click()
  await page.getByRole("link", { name: "Close chart" }).click()
})
