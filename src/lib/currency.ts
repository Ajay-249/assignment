/**
 * Currency utility functions for Indian Rupees (INR)
 * All backend API amounts are stored in paise (1 INR = 100 paise)
 */

export function paiseToRupees(paise: number): number {
  return paise / 100;
}

export function formatPaiseToINR(
  paise: number,
  options: { showDecimals?: boolean; includeSymbol?: boolean } = {}
): string {
  const { showDecimals = false, includeSymbol = true } = options;
  const rupees = paiseToRupees(paise);

  const formatter = new Intl.NumberFormat('en-IN', {
    style: includeSymbol ? 'currency' : 'decimal',
    currency: 'INR',
    minimumFractionDigits: showDecimals ? 2 : (rupees % 1 === 0 ? 0 : 2),
    maximumFractionDigits: 2,
  });

  return formatter.format(rupees);
}

export function formatINRWithDecimals(paise: number): string {
  return formatPaiseToINR(paise, { showDecimals: true, includeSymbol: true });
}
