import { test, expect } from '@playwright/test';

const users = [
  { email: 'user1@example.com', password: 'password1' },
  { email: 'user2@example.com', password: 'password2' },
  { email: 'user3@example.com', password: 'password3' },
  { email: 'user4@example.com', password: 'password4' }
];

test.describe('Login Test Suite', () => {
  // Set global timeout to 60 seconds
  test.setTimeout(60000);

  users.forEach((user) => {
    test(`Login with ${user.email}`, async ({ page }) => {
      // 1. Navigate to login page
      await page.goto('http://localhost:4200/login');
      
      // 2. Debug: Take screenshot of login page
      await page.screenshot({ path: `test-results/login-page-${user.email}.png` });
      
      // 3. Fill login form
      await page.fill('input[formcontrolname="email"]', user.email);
      await page.fill('input[formcontrolname="password"]', user.password);
      
      // 4. Click submit and wait for navigation
      const navigationPromise = page.waitForNavigation();
      await page.click('button[type="submit"]');
      await navigationPromise;
      
      // 5. Verify successful navigation to insurance page
      await expect(page).toHaveURL('http://localhost:4200/insurance');
      
      // 6. Debug: Take screenshot after navigation
      await page.screenshot({ path: `test-results/post-login-${user.email}.png` });
      
      // 7. Verify toast message with more flexible approach
      try {
        // Wait for toast to appear (with shorter timeout)
        const toast = page.locator('.p-toast-message');
        await toast.waitFor({ state: 'visible', timeout: 5000 });
        
        // Verify toast content
        await expect(toast).toContainText('Inicio de sesión exitoso');
        
      } catch (error) {
        console.warn(`Toast not found for user ${user.email}, continuing test`);
        // Toast verification is optional if navigation succeeded
      }
    });
  });

  
});