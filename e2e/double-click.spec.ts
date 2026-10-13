import { test, expect } from '@playwright/test';

test.describe('Double Click and Idempotency Protection', () => {
  test('rapid double-clicking Pay button only triggers a single payment request', async ({ page }) => {
    // Intercept payment network requests to count outgoing POST calls and inspect headers
    const paymentRequests: { idempotencyKey: string | null }[] = [];

    await page.route('**/api/payments', async (route) => {
      const request = route.request();
      if (request.method() === 'POST') {
        paymentRequests.push({
          idempotencyKey: request.headers()['idempotency-key'] || null,
        });
      }
      await route.continue();
    });

    // 1. Visit checkout page
    await page.goto('/checkout/order_149900');

    // 2. Wait for order summary to load
    await expect(page.locator('text=Total Payable Amount')).toBeVisible();

    // If on Step 1 (Products Detail), proceed to Step 2 (Payment Page)
    const proceedButton = page.locator('#proceed-to-payment-button');
    if (await proceedButton.isVisible()) {
      await proceedButton.click();
    }

    // 3. Fill in a valid UPI ID
    const upiInput = page.locator('#upi-id-input');
    await upiInput.fill('ananya.sharma@okhdfcbank');

    const payButton = page.locator('#pay-button');
    await expect(payButton).toBeEnabled();

    // 4. Perform rapid double click on Pay button
    await payButton.dblclick();

    // 5. Button must become disabled immediately to block concurrent user taps
    await expect(payButton).toBeDisabled();

    // 6. Wait for processing / confirming state
    await expect(
      page.locator('text=Initiating Payment...').or(page.locator('text=We are confirming your payment'))
    ).toBeVisible();

    // 7. Assert that ONLY one payment POST request was dispatched
    expect(paymentRequests.length).toBe(1);
    expect(paymentRequests[0].idempotencyKey).toBeTruthy();
    expect(paymentRequests[0].idempotencyKey).toMatch(/^idem_order_149900_/);
  });
});
