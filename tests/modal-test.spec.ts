import { test, expect } from '@playwright/test'

test('test authentication and resource modals', async ({ page }) => {
  await page.goto('http://localhost:5173')
  
  // Test login modal
  console.log('Testing login modal...')
  await page.click('text=Log ind / Opret konto')
  await page.waitForTimeout(1000)
  
  // Take screenshot of login modal
  await page.screenshot({ 
    path: 'login-modal.png', 
    fullPage: true 
  })
  
  // Close modal by clicking outside or X button
  const closeButton = page.locator('button[aria-label="Luk"]')
  if (await closeButton.count() > 0) {
    await closeButton.click()
  } else {
    // Click outside modal
    await page.click('body', { position: { x: 50, y: 50 } })
  }
  
  await page.waitForTimeout(500)
  
  // Take screenshot of main page after modal closed
  await page.screenshot({ 
    path: 'page-after-modal.png', 
    fullPage: true 
  })
})