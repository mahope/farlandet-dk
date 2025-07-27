import { test, expect } from '@playwright/test'

test('test new router and pages', async ({ page }) => {
  // Enable console logs to catch any errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()))
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message))
  
  await page.goto('http://localhost:5178')
  await page.waitForTimeout(3000)
  
  console.log('Testing router setup...')
  
  // Check if page content loaded
  const bodyText = await page.locator('body').textContent()
  console.log('Page content loaded:', bodyText ? 'YES' : 'NO')
  console.log('Body text length:', bodyText?.length || 0)
  
  if (bodyText && bodyText.length > 0) {
    console.log('First 200 chars:', bodyText.substring(0, 200))
  }
  
  // Check for navigation
  const navLinks = await page.locator('nav a').count()
  console.log('Navigation links found:', navLinks)
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'router-test.png', 
    fullPage: true 
  })
})