import { test, expect } from '@playwright/test'

test('landing renderiza y crear sala lleva al lobby', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (e) => errors.push(e.message))

  await page.goto('#/')
  await expect(page.getByRole('heading', { name: /Fiesta P2P/ })).toBeVisible()
  await page.getByRole('button', { name: /Crear sala/ }).click()

  await expect(page).toHaveURL(/#\/sala\/[A-Za-z0-9]{6}/)
  await expect(page.getByRole('heading', { name: /Sala/ })).toBeVisible()

  expect(errors).toEqual([])
})
