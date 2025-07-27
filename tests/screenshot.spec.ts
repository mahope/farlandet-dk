import { test, expect } from '@playwright/test'

test('take screenshot of the app', async ({ page }) => {
  // Go to the development server
  await page.goto('http://localhost:5173')
  
  // Wait for the page to load
  await page.waitForTimeout(2000)
  
  // Take a full page screenshot
  await page.screenshot({ 
    path: 'homepage-screenshot.png', 
    fullPage: true 
  })
  
  // Check if the page loaded properly
  await expect(page).toHaveTitle(/Danish Fathers Directory|Vite/)
  
  // Look for key elements
  const header = page.locator('header')
  if (await header.count() > 0) {
    await expect(header).toBeVisible()
  }
  
  // Take another screenshot after waiting
  await page.waitForTimeout(3000)
  await page.screenshot({ 
    path: 'homepage-loaded.png', 
    fullPage: true 
  })
})