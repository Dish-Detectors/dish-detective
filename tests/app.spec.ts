import { test, expect } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await expect(
    page.getByRole("button", { name: "Prijava" }).nth(0),
  ).toBeVisible();
  await page.getByRole("button", { name: "Prijava" }).nth(0).click();
  await expect(
    page.getByRole("menuitem", { name: "Radnik u menzi" }),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Radnik u menzi" }).click();
  await expect(page).toHaveURL("/login/employee");
  await page.goto("http://localhost:3000/");
  await page.getByRole("button", { name: "Prijava" }).nth(0).click();
  await expect(page.getByRole("menuitem", { name: "Student" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Student" }).click();
  await expect(page).toHaveURL("/login/student");
});
