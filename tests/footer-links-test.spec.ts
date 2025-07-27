import { test, expect } from '@playwright/test'

test('test all footer links navigation', async ({ page }) => {
  // Enable console logs to catch any errors
  page.on('console', msg => console.log('CONSOLE:', msg.text()))
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message))
  
  await page.goto('http://localhost:5178')
  await page.waitForTimeout(2000)
  
  console.log('Testing footer links navigation...')
  
  // Test footer link to Resources
  console.log('Testing "Alle Ressourcer" link...')
  await page.click('footer a[href="/resources"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Alle Ressourcer')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Categories link
  console.log('Testing "Kategorier" link...')
  await page.click('footer a[href="/categories"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Kategorier')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Random Resource link
  console.log('Testing "Tilfældig Ressource" link...')
  await page.click('footer a[href="/random"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Tilfældig Ressource')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Submit link
  console.log('Testing "Bidrag med Indhold" link...')
  await page.click('footer a[href="/submit"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Bidrag med Indhold')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Guidelines link
  console.log('Testing "Retningslinjer" link...')
  await page.click('footer a[href="/guidelines"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Retningslinjer for Fællesskabet')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Privacy link
  console.log('Testing "Privatlivspolitik" link...')
  await page.click('footer a[href="/privacy"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Privatlivspolitik')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Contact link
  console.log('Testing "Kontakt" link...')
  await page.click('footer a[href="/contact"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Kontakt os')
  
  // Navigate back to home
  await page.click('a[href="/"]')
  await page.waitForTimeout(1000)
  
  // Test Support link
  console.log('Testing "Support" link...')
  await page.click('footer a[href="/support"]')
  await page.waitForTimeout(1000)
  await expect(page.locator('h1')).toContainText('Support Center')
  
  console.log('All footer links tested successfully!')
  
  // Take a final screenshot of the support page
  await page.screenshot({ 
    path: 'footer-links-test.png', 
    fullPage: true 
  })
})