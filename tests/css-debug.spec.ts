import { test, expect } from '@playwright/test'

test('debug CSS loading', async ({ page }) => {
  // Enable console logs
  page.on('console', msg => console.log('CONSOLE:', msg.text()))
  
  await page.goto('http://localhost:5173')
  await page.waitForTimeout(2000)
  
  // Check if CSS is loading
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets)
    return sheets.map(sheet => ({
      href: sheet.href,
      disabled: sheet.disabled,
      rulesCount: sheet.cssRules ? sheet.cssRules.length : 0
    }))
  })
  
  console.log('Stylesheets:', stylesheets)
  
  // Check computed styles of a key element
  const headerStyles = await page.evaluate(() => {
    const header = document.querySelector('h1')
    if (!header) return null
    
    const styles = window.getComputedStyle(header)
    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      color: styles.color,
      marginBottom: styles.marginBottom,
      display: styles.display
    }
  })
  
  console.log('Header styles:', headerStyles)
  
  // Check if Tailwind classes are working
  const buttonStyles = await page.evaluate(() => {
    const button = document.querySelector('button')
    if (!button) return null
    
    const styles = window.getComputedStyle(button)
    return {
      backgroundColor: styles.backgroundColor,
      padding: styles.padding,
      borderRadius: styles.borderRadius,
      border: styles.border,
      className: button.className
    }
  })
  
  console.log('Button styles:', buttonStyles)
  
  // Take a screenshot for visual comparison
  await page.screenshot({ 
    path: 'css-debug.png', 
    fullPage: true 
  })
})