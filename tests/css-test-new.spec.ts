import { test, expect } from '@playwright/test'

test('test CSS on new server', async ({ page }) => {
  await page.goto('http://localhost:5175')
  await page.waitForTimeout(3000)
  
  // Check computed styles of a key element
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('button')
    if (!button) return null
    
    const styles = window.getComputedStyle(button)
    return {
      backgroundColor: styles.backgroundColor,
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      border: styles.border,
      className: button.className,
      display: styles.display
    }
  })
  
  console.log('Button styles on new server:', buttonStyles)
  
  // Check stylesheet info
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets)
    return sheets.map(sheet => ({
      href: sheet.href,
      disabled: sheet.disabled,
      rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
    }))
  })
  
  console.log('Stylesheets on new server:', stylesheets)
  
  // Take a screenshot
  await page.screenshot({ 
    path: 'new-server-test.png', 
    fullPage: true 
  })
})