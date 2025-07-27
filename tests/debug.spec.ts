import { test, expect } from '@playwright/test'

test('debug page loading issues', async ({ page }) => {
  // Capture console logs and errors
  const logs: string[] = []
  const errors: string[] = []
  
  page.on('console', msg => {
    logs.push(`CONSOLE ${msg.type()}: ${msg.text()}`)
    console.log(`CONSOLE ${msg.type()}: ${msg.text()}`)
  })
  
  page.on('pageerror', error => {
    errors.push(`PAGE ERROR: ${error.message}`)
    console.log(`PAGE ERROR: ${error.message}`)
  })
  
  // Go to the development server
  console.log('Navigating to localhost:5173...')
  await page.goto('http://localhost:5173')
  
  // Wait a bit for any errors to surface
  await page.waitForTimeout(5000)
  
  // Try to find any content
  const body = await page.locator('body').textContent()
  console.log('Body content:', body)
  
  // Check for React root
  const reactRoot = page.locator('#root')
  const hasRoot = await reactRoot.count() > 0
  console.log('Has React root:', hasRoot)
  
  if (hasRoot) {
    const rootContent = await reactRoot.textContent()
    console.log('Root content:', rootContent)
  }
  
  // Print captured logs and errors
  console.log('\n=== CAPTURED LOGS ===')
  logs.forEach(log => console.log(log))
  
  console.log('\n=== CAPTURED ERRORS ===')
  errors.forEach(error => console.log(error))
  
  // Take a screenshot for debugging
  await page.screenshot({ 
    path: 'debug-screenshot.png', 
    fullPage: true 
  })
})