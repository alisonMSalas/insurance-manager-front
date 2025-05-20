import { test, expect } from '@playwright/test';

test.describe('Rutas de navegación', () => {
  test('Debería redirigir al login si no está autenticado', async ({ page }) => {
    await page.goto('http://localhost:4200');
    await page.click('a[href="/users"]');
    // Verificar que redirige al login
    await expect(page.url()).toContain('/login');
  });

  test('Debería permitir la navegación a las rutas protegidas si está autenticado', async ({ page }) => {
    // Simula un inicio de sesión
    await page.goto('http://localhost:4200/login');
    await page.fill('input[name="username"]', 'usuarioPrueba');
    await page.fill('input[name="password"]', 'contraseñaPrueba');
    await page.click('button[type="submit"]');
    
    // Luego de iniciar sesión, verificar que puede acceder a una ruta protegida
    await page.goto('http://localhost:4200/insurance');
    await expect(page).toHaveURL('http://localhost:4200/insurance');
  });
});
