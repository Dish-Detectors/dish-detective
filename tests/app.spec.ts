import { test, expect } from "@playwright/test";

test("admin dish creation", async ({ page, isMobile }) => {
  test.skip(isMobile, "Admin isn't supposed work from mobile viewports");
  await page.goto("http://employee.localhost:3000/login/employee");
  await page.getByRole("textbox", { name: "Korisničko ime" }).click();
  await page.getByRole("textbox", { name: "Korisničko ime" }).fill("admin");
  await page.getByRole("textbox", { name: "Lozinka" }).click();
  await page.getByRole("textbox", { name: "Lozinka" }).fill("admin");
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await page.locator("div").filter({ hasText: "Jela" }).nth(5).click();
  await page.getByRole("button", { name: "add dish" }).click();
  await page.getByRole("textbox", { name: "Unesite opis jela..." }).click();
  await page
    .getByRole("textbox", { name: "Unesite opis jela..." })
    .fill("test jelo");
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image-content"),
  });
  await page.getByRole("combobox", { name: "Odaberi alergene" }).click();
  await page.getByRole("option", { name: "Jaje" }).click();
  await page.getByRole("textbox", { name: "Naziv jela" }).click();
  await page.getByRole("textbox", { name: "Naziv jela" }).fill("Testno jelo");
  await page.getByRole("button", { name: "Kreiraj jelo" }).click();
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
});
test("admin dish creation of already existing dish", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Admin isn't supposed work from mobile viewports");
  await page.goto("http://employee.localhost:3000/login/employee");
  await page.getByRole("textbox", { name: "Korisničko ime" }).click();
  await page.getByRole("textbox", { name: "Korisničko ime" }).fill("admin");
  await page.getByRole("textbox", { name: "Lozinka" }).click();
  await page.getByRole("textbox", { name: "Lozinka" }).fill("admin");
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await page.locator("div").filter({ hasText: "Jela" }).nth(5).click();
  await page.getByRole("button", { name: "add dish" }).click();
  await page.getByRole("textbox", { name: "Unesite opis jela..." }).click();
  await page
    .getByRole("textbox", { name: "Unesite opis jela..." })
    .fill("test jelo");
  await page.locator('input[type="file"]').setInputFiles({
    name: "test.png",
    mimeType: "image/png",
    buffer: Buffer.from("fake-image-content"),
  });
  await page.getByRole("combobox", { name: "Odaberi alergene" }).click();
  await page.getByRole("option", { name: "Jaje" }).click();
  await page.getByRole("textbox", { name: "Naziv jela" }).click();
  await page.getByRole("textbox", { name: "Naziv jela" }).fill("Testno jelo");
  await page.getByRole("button", { name: "Kreiraj jelo" }).click();
  await expect(page.getByText("A dish with this name already")).toBeVisible();
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
});

test("wrong login for worker", async ({ page }) => {
  await page.goto("http://employee.localhost:3000/login/employee");
  await page.getByRole("textbox", { name: "Korisničko ime" }).click();
  await page.getByRole("textbox", { name: "Korisničko ime" }).fill("worker");
  await page.getByRole("textbox", { name: "Korisničko ime" }).press("Tab");
  await page.getByRole("textbox", { name: "Lozinka" }).fill("test");
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await expect(page.getByText("Neispravno korisničko ime ili")).toBeVisible();
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
});

test("manual redirect test", async ({ page }) => {
  await page.goto("http://employee.localhost:3000/login/employee");
  await page.getByRole("textbox", { name: "Korisničko ime" }).click();
  await page.getByRole("textbox", { name: "Korisničko ime" }).fill("worker");
  await page.getByRole("textbox", { name: "Lozinka" }).click();
  await page.getByRole("textbox", { name: "Lozinka" }).fill("worker");
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await page.goto("http://employee.localhost:3000/admin");
  await page.getByRole("button", { name: "Open user menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
});
