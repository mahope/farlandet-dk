import { test, expect } from '@playwright/test'

test('test Tailwind CSS v4 functionality', async ({ page }) => {
  // Enable console logs to catch any errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()))
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message))
  
  await page.goto('http://localhost:5176')
  await page.waitForTimeout(3000)
  
  console.log('Testing Tailwind CSS v4...')
  
  // Check stylesheet info
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets)
    return sheets.map(sheet => ({
      href: sheet.href,
      disabled: sheet.disabled,
      rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
    }))
  })
  
  console.log('Stylesheets:', stylesheets)
  
  // Check if page content loaded
  const bodyText = await page.locator('body').textContent()
  console.log('Page loaded:', bodyText ? 'YES' : 'NO')
  
  // Check button styles
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('button')
    if (!button) return null
    
    const styles = window.getComputedStyle(button)
    return {
      backgroundColor: styles.backgroundColor,
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      className: button.className,
      display: styles.display,
      color: styles.color
    }
  })
  
  console.log('Button styles:', buttonStyles)
  
  // Check if custom colors are working
  const backgroundStyle = await page.evaluate(() => {
    const body = document.body
    const styles = window.getComputedStyle(body)
    return {
      backgroundColor: styles.backgroundColor,
      color: styles.color
    }
  })
  
  console.log('Body styles:', backgroundStyle)
  
  // Take a screenshot to see visual result
  await page.screenshot({ 
    path: 'tailwind-v4-test.png', 
    fullPage: true 
  })
})