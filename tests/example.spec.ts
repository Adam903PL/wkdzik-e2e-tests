import { test, expect, Page, Locator } from '@playwright/test';

async function findFirstVisible(page: Page, locator: Locator, timeout = 5000): Promise<Locator | null> {
  const endTime = Date.now() + timeout;

  while (Date.now() <= endTime) {
    const count = await locator.count();

    for (let i = 0; i < count; i++) {
      const candidate = locator.nth(i);

      try {
        if (await candidate.isVisible()) {
          return candidate;
        }
      } catch (e) {}
    }

    await page.waitForTimeout(200);
  }

  return null;
}

async function clickFirstVisible(page: Page, locator: Locator, timeout = 5000) {
  const target = await findFirstVisible(page, locator, timeout);

  if (!target) {
    throw new Error('No visible element found for click');
  }

  await target.scrollIntoViewIfNeeded().catch(() => {});
  await target.click();
  return target;
}

function exactText(text: string) {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

const CLOTHING_PRODUCT_URL = 'https://wkdzik.pl/damskie-spodnie-interlock-biale-dzik';
const CLOTHING_PRODUCT_NAME = 'SPODNIE DAMSKIE INTERLOCK OVERSIZE BIAŁE DZIK®';

type LoginCredentials = {
  email: string;
  password: string;
};

function getLoginCredentials(): LoginCredentials {
  const email = process.env.WKDZIK_LOGIN_EMAIL;
  const password = process.env.WKDZIK_LOGIN_PASSWORD;

  if (!email || !password) {
    throw new Error('Missing WKDZIK_LOGIN_EMAIL or WKDZIK_LOGIN_PASSWORD in .env');
  }

  return { email, password };
}

function createDisposableAccount(): LoginCredentials {
  const suffix = `${Date.now()}${Math.floor(Math.random() * 10000)}`;

  return {
    email: `wkdzik.playwright.${suffix}@example.com`,
    password: `Test-${suffix}!Aa`,
  };
}

async function logIn(page: Page, account = getLoginCredentials()) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await page.goto('https://wkdzik.pl/pl/login', { waitUntil: 'domcontentloaded' });
    await handleInitialModals(page);

    await page.locator('#mail_input_long').fill(account.email);
    await page.locator('#pass_input_long').fill(account.password);
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {}),
      page.locator('.btn.btn-red.login').click(),
    ]);

    const invalidLoginMessage = page.getByText(/Niepoprawne dane logowania/i).first();
    if (await invalidLoginMessage.isVisible().catch(() => false)) {
      if (attempt === maxAttempts) {
        throw new Error('Credentials from .env are rejected by wkdzik.pl');
      }

      await page.waitForTimeout(2000);
      continue;
    }

    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
    await handleInitialModals(page);

    if (await page.locator('a.myaccount[href*="/pl/panel"]').first().isVisible({ timeout: 10000 }).catch(() => false)) {
      return;
    }

    if (attempt === maxAttempts) {
      throw new Error('Login did not expose the customer panel link');
    }

    await page.waitForTimeout(1000);
  }
}

async function registerDisposableAccount(page: Page) {
  const account = createDisposableAccount();

  await page.goto('https://wkdzik.pl/pl/reg?', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);

  await page.locator('#input_mail').fill(account.email);
  await page.locator('#input_pass1').fill(account.password);
  await page.locator('#input_pass2').fill(account.password);
  await page.locator('#input_newsletter').uncheck().catch(() => {});
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {}),
    page.getByRole('button', { name: /Zarejestruj/i }).click(),
  ]);

  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await handleInitialModals(page);

  if (await page.locator('a.myaccount[href*="/pl/panel"]').first().isVisible({ timeout: 10000 }).catch(() => false)) {
    return account;
  }

  await logIn(page, account);
  return account;
}

async function ensureLoggedIn(page: Page) {
  try {
    await logIn(page);
  } catch (error) {
    await registerDisposableAccount(page);
  }
}

async function openCustomerPanel(page: Page) {
  await logIn(page);
  await page.goto('https://wkdzik.pl/pl/panel', { waitUntil: 'commit', timeout: 30000 });
  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await handleInitialModals(page);
  await expect(page.locator('#box_panel')).toBeVisible({ timeout: 15000 });
}

/**
 * Handles initial blocking modals like Age Gate (18+) and Cookie Consent.
 * This is crucial for wkdzik.pl as these modals often appear with a delay
 * and block interaction with the menu and search.
 */
async function handleInitialModals(page: Page) {
  // 1. Age Gate (18+)
  const ageGateBtn = await findFirstVisible(page, page.locator('#adult-btn'), 4000);
  try {
    if (ageGateBtn) {
      await ageGateBtn.click();
      await ageGateBtn.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
  } catch (e) {}

  // 2. Cookie Consent Modal - can be delayed up to 10 seconds
  // Standard Shoper cookie bar selectors
  const cookieButton = await findFirstVisible(
    page,
    page.locator([
    'button:has-text("Akceptuję")',
      'button:has-text("Zaakceptuj wszystkie")',
      '.js__accept-all-consents',
      'button:has-text("Akceptuj")',
      '.js__accept-all',
    '#cookie-accept',
    '.cookie-bar .btn',
    '.alert-cookies .btn'
    ].join(', ')),
    10000,
  );

  if (cookieButton) {
    try {
      await cookieButton.click();
      await cookieButton.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(500);
    } catch (e) {}
  }
}

async function exposeClosedShadowRoots(page: Page) {
  await page.addInitScript(() => {
    const originalAttachShadow = Element.prototype.attachShadow;

    Element.prototype.attachShadow = function (init) {
      return originalAttachShadow.call(this, { ...init, mode: 'open' });
    };
  });
}

/**
 * Robustly selects a variant (size/color) on the product page.
 * If multiple variant groups exist (e.g. for bundles), it tries to select one in each.
 */
async function clickProductVariant(page: Page, variantText: string, timeout = 3000) {
  const option = await findFirstVisible(
    page,
    page.locator('.option_select .xselect:not(.disabled), .variant-val:not(.disabled)').filter({
      hasText: exactText(variantText),
    }),
    timeout,
  );

  if (!option) {
    throw new Error(`Variant "${variantText}" is not visible`);
  }

  await option.click();
  await page.waitForTimeout(300);
  return option;
}

async function selectProductVariants(page: Page, preferredVariant = 'M') {
  const optionGroups = page.locator('.option_select, .product-variants .group, .variants-container .variant-group');
  const groupCount = await optionGroups.count();
  let selectedAny = false;

  if (groupCount > 0) {
    for (let i = 0; i < groupCount; i++) {
      const group = optionGroups.nth(i);
      const selectableOptions = group.locator('.xselect:not(.disabled), .variant-val:not(.disabled)');
      const option =
        await findFirstVisible(page, selectableOptions.filter({ hasText: exactText(preferredVariant) }), 700) ||
        await findFirstVisible(page, selectableOptions.locator('.selected, .active'), 700) ||
        await findFirstVisible(page, selectableOptions, 2000);

      if (option) {
        await option.click();
        selectedAny = true;
        await page.waitForTimeout(500);
      }
    }

    return selectedAny;
  }

  const standaloneOptions = page.locator('.xselect:not(.disabled), .variant-val:not(.disabled)');
  const standaloneOption =
    await findFirstVisible(page, standaloneOptions.filter({ hasText: exactText(preferredVariant) }), 700) ||
    await findFirstVisible(page, standaloneOptions, 2000);

  if (standaloneOption) {
    await standaloneOption.click();
    return true;
  }

  return false;
}

async function getVisibleAddToBasketButton(page: Page, timeout = 2000) {
  const button = await findFirstVisible(
    page,
    page.locator('.addtobasket:not([disabled]), button:has-text("Do koszyka"):not([disabled])'),
    timeout,
  );

  if (button && await button.isEnabled()) {
    return button;
  }

  return null;
}

type CategoryProduct = {
  name: string;
  href: string;
};

async function getCategoryProducts(page: Page, categoryUrl: string, maxProducts = 24): Promise<CategoryProduct[]> {
  await page.goto(categoryUrl, { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await page.waitForTimeout(1000);

  return page.locator('.prodname').evaluateAll((elements, limit) => {
    return elements.slice(0, limit as number).map((element) => {
      const link = element.closest('a') || element.querySelector('a');

      return {
        name: (element.textContent || '').trim(),
        href: link instanceof HTMLAnchorElement ? link.href : '',
      };
    }).filter((product) => product.href);
  }, maxProducts);
}

function rankCategoryProducts(products: CategoryProduct[]) {
  const likelySizedClothing = /(spodnie|bluza|koszul|leggins|shorty|top|stanik)/i;
  const likelyBundleOrAccessory = /(zestaw|czapka|kubek|skarpet|torba|bidon|shaker|pas)/i;
  const rankedProducts = [
    ...products.filter((product) => likelySizedClothing.test(product.name) && !likelyBundleOrAccessory.test(product.name)),
    ...products.filter((product) => !likelyBundleOrAccessory.test(product.name)),
    ...products,
  ];
  const seen = new Set<string>();

  return rankedProducts.filter((product) => {
    if (seen.has(product.href)) {
      return false;
    }

    seen.add(product.href);
    return true;
  });
}

async function openAvailableProductFromCategory(page: Page, categoryUrl = 'https://wkdzik.pl/ubrania', preferredVariant = 'M') {
  const fallbackProduct = {
    name: 'SPODNIE DAMSKIE INTERLOCK OVERSIZE BIALE DZIK',
    href: 'https://wkdzik.pl/damskie-spodnie-interlock-biale-dzik',
  };
  const products = rankCategoryProducts(await getCategoryProducts(page, categoryUrl));
  const preferredProduct = products.find((product) => product.href.includes('/damskie-spodnie-interlock-biale-dzik')) ||
    products[0] ||
    fallbackProduct;
  const candidates = [preferredProduct, fallbackProduct, ...products.slice(0, 6)].filter((product, index, list) => {
    return list.findIndex((candidate) => candidate.href === product.href) === index;
  });

  for (const product of candidates) {
    try {
      await page.goto(product.href, { waitUntil: 'domcontentloaded' });
      await handleInitialModals(page);
      await selectProductVariants(page, preferredVariant);

      if (await getVisibleAddToBasketButton(page, 2500)) {
        return;
      }
    } catch (e) {}
  }

  throw new Error(`No purchasable product found in category ${categoryUrl}`);
}

async function addFirstProductToCart(page: Page, categoryUrl = 'https://wkdzik.pl/ubrania') {
  await openAvailableProductFromCategory(page, categoryUrl, 'M');
  await handleInitialModals(page);
  const addToBasketButton = await getVisibleAddToBasketButton(page, 5000);

  if (!addToBasketButton) {
    throw new Error('Add to basket button is not visible for the selected product');
  }

  await addToBasketButton.click();
  await expect(page.locator('body')).toContainText(/dodano do koszyka/i, { timeout: 20000 });
  await expect(page.locator('a[href*="/pl/basket/rc"]').first()).toBeVisible({ timeout: 10000 });
}

async function openBasket(page: Page) {
  await page.evaluate(() => {
    window.location.href = '/pl/basket';
  });
  await page.waitForURL(/\/pl\/basket/, { timeout: 30000 }).catch(() => {});

  if (!/\/pl\/basket/.test(page.url())) {
    await page.goto('https://wkdzik.pl/pl/basket', { waitUntil: 'domcontentloaded', timeout: 60000 });
  }

  if (!/\/pl\/basket/.test(page.url())) {
    throw new Error(`Basket page did not open. Current URL: ${page.url()}`);
  }

  await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});
  await handleInitialModals(page);
}

async function addClothingProductToBasket(page: Page) {
  await ensureLoggedIn(page);
  await page.goto(CLOTHING_PRODUCT_URL, { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);

  await clickFirstVisible(
    page,
    page.locator('.option_select .xselect:not(.disabled)').filter({ hasText: exactText('XS') }),
  );
  await clickFirstVisible(page, page.locator('.addtobasket:not([disabled])'));

  const addedToBasketModal = page.locator('.modal.modal-visible');
  await expect(addedToBasketModal).toBeVisible({ timeout: 20000 });
  await expect(addedToBasketModal).toContainText('Pomyślnie dodano do koszyka');
  await expect(addedToBasketModal).toContainText(CLOTHING_PRODUCT_NAME);
  await expect(addedToBasketModal).toContainText('XS');

  await addedToBasketModal.locator('.modal-close').click();
  await expect(addedToBasketModal).toBeHidden({ timeout: 10000 });
  await openBasket(page);
}

async function fillCheckoutAddress(page: Page) {
  const suffix = `${Date.now()}`.slice(-6);
  const checkoutFields = page.locator('#app input.el-input__inner');

  await checkoutFields.nth(2).fill(`Jan${suffix}`);
  await checkoutFields.nth(3).fill('Testowy');
  await checkoutFields.nth(4).fill(`501${suffix.slice(-6)}`);
  await checkoutFields.nth(5).fill(`Testowa ${Number(suffix.slice(-2)) || 1}`);
  await checkoutFields.nth(6).fill('00-001');
  await checkoutFields.nth(7).fill('Warszawa');
}

async function prepareBasketWithSingleProduct(page: Page) {
  await page.context().clearCookies();
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await addFirstProductToCart(page);
  await openBasket(page);
  const basketProduct = page.locator('#app .wk-product').first();
  await expect(basketProduct).toBeVisible({ timeout: 15000 });
}

async function selectBasketQuantity(page: Page, quantity: string) {
  await clickFirstVisible(page, page.locator('#app .basket_quantity_input .el-select'));
  await clickFirstVisible(
    page,
    page.locator('.el-select-dropdown__item').filter({ hasText: new RegExp(`^\\s*${quantity}\\s*$`) }),
    5000,
  );
  await expect(page.locator('#app .basket_quantity_input .el-input__inner').first()).toHaveValue(quantity, { timeout: 10000 });
}

function parseCurrency(text: string) {
  const match = text.match(/(\d[\d\s]*,\d{2})\s*zł/i);

  if (!match) {
    throw new Error(`Could not parse PLN currency from "${text}"`);
  }

  return Number(match[1].replace(/\s/g, '').replace(',', '.'));
}

async function getVisibleListingPrices(page: Page) {
  const prices = await page.locator('.product.s-grid-3').evaluateAll((products) => {
    return products
      .filter((product) => {
        const style = window.getComputedStyle(product);
        return style.display !== 'none' && style.visibility !== 'hidden' && product.getBoundingClientRect().height > 0;
      })
      .map((product) => {
        const name = product.querySelector('.prodname')?.textContent?.trim() || '';
        const priceText = product.querySelector('.price')?.textContent?.replace(/\s+/g, ' ').trim() || '';
        const currentPrice = priceText.match(/(\d[\d\s]*,\d{2})\s*zł/i)?.[1] || '';

        return {
          name,
          price: currentPrice ? Number(currentPrice.replace(/\s/g, '').replace(',', '.')) : Number.NaN,
        };
      })
      .filter((product) => product.name && Number.isFinite(product.price));
  });

  if (prices.length < 3) {
    throw new Error(`Expected at least 3 priced products, got ${prices.length}`);
  }

  return prices;
}

async function expectListingPricesSorted(page: Page, direction: 'asc' | 'desc') {
  const products = await getVisibleListingPrices(page);
  const prices = products.slice(0, 12).map((product) => product.price);

  if (direction === 'asc') {
    const sorted = [...prices].sort((a, b) => a - b);

    expect(prices, `Visible product prices are not sorted asc: ${products.map((product) => `${product.name}=${product.price}`).join(', ')}`)
      .toEqual(sorted);
    return;
  }

  const maxPrice = Math.max(...prices);
  const topThreePrices = prices.slice(0, 3);
  const topHalfAverage = prices.slice(0, 6).reduce((sum, price) => sum + price, 0) / 6;
  const bottomHalfAverage = prices.slice(6, 12).reduce((sum, price) => sum + price, 0) / 6;

  expect(prices[0], `First visible product should have the highest displayed price: ${products.map((product) => `${product.name}=${product.price}`).join(', ')}`)
    .toBe(maxPrice);
  expect(topThreePrices, `Top visible products should start in descending order: ${products.map((product) => `${product.name}=${product.price}`).join(', ')}`)
    .toEqual([...topThreePrices].sort((a, b) => b - a));
  expect(topHalfAverage, `The top half should be more expensive than the bottom half after descending sort: ${products.map((product) => `${product.name}=${product.price}`).join(', ')}`)
    .toBeGreaterThan(bottomHalfAverage);
}

async function expectProductListingLoaded(page: Page, expectedUrl: RegExp, expectedText?: RegExp) {
  await expect(page).toHaveURL(expectedUrl);
  await expect(page.locator('.product.s-grid-3 .prodname').first()).toBeVisible({ timeout: 15000 });

  if (expectedText) {
    await expect(page.locator('body')).toContainText(expectedText);
  }
}

async function getVisibleProductLinks(page: Page, limit = 3) {
  const links = await page.locator('.product.s-grid-3').evaluateAll((products, maxLinks) => {
    return products
      .filter((product) => {
        const style = window.getComputedStyle(product);
        return style.display !== 'none' && style.visibility !== 'hidden' && product.getBoundingClientRect().height > 0;
      })
      .map((product) => {
        const name = product.querySelector('.prodname')?.textContent?.trim() || '';
        const link = product.querySelector('a.prodname, .prodname a, a.prodimage');

        return {
          name,
          href: link instanceof HTMLAnchorElement ? link.href : '',
        };
      })
      .filter((product) => product.href && !/zestaw/i.test(product.name))
      .slice(0, maxLinks as number);
  }, limit);

  if (links.length === 0) {
    throw new Error('Expected product links in listing');
  }

  return links;
}

async function expectProductsHaveVariant(page: Page, links: CategoryProduct[], variant: string) {
  for (const product of links) {
    await page.goto(product.href, { waitUntil: 'domcontentloaded' });
    await handleInitialModals(page);

    await expect(
      page.locator('.option_select .xselect:not(.disabled), .variant-val:not(.disabled)').filter({ hasText: exactText(variant) }).first(),
      `Product "${product.name}" from filtered listing should expose size ${variant}`,
    ).toBeVisible({ timeout: 10000 });
  }
}

async function selectProductSort(page: Page, hrefFragment: string) {
  await clickFirstVisible(page, page.locator('.products-sort-container .products-active-sort'));
  await clickFirstVisible(page, page.locator(`.products-sort-options a[href*="${hrefFragment}"]`), 5000);
  await page.waitForLoadState('domcontentloaded');
  await handleInitialModals(page);
  await page.waitForTimeout(1000);
}

// ─────────────────────────────────────────────
// TC_WKD_001 – Ładowanie strony głównej
// ─────────────────────────────────────────────
test('TC_WKD_001 – Poprawne załadowanie strony głównej', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  
  await expect(page).toHaveTitle(/WKDZIK/);
  await expect(page.getByRole('link', { name: 'NOWOŚCI' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'UBRANIA' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'SUPLEMENTY' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'AKCESORIA' }).first()).toBeVisible();
});

// ─────────────────────────────────────────────
// TC_WKD_002 – Logowanie użytkownika sukces
// ─────────────────────────────────────────────
test('TC_WKD_002 – Poprawne logowanie użytkownika', async ({ page }) => {
  await openCustomerPanel(page);
  const customerPanel = page.locator('#box_panel');

  await expect(page).toHaveURL(/\/pl\/panel$/);
  await expect(customerPanel).toBeVisible({ timeout: 15000 });
  await expect(customerPanel.locator('.boxhead')).toContainText('Panel klienta');
  await expect(customerPanel.locator('.custom-panel-links')).toContainText('Edycja profilu');
  await expect(customerPanel.locator('.custom-panel-links')).toContainText('Zmień hasło');
  await expect(customerPanel.locator('.custom-panel-links')).toContainText('Wyloguj');
  await expect(customerPanel.locator('.innerbox')).toContainText('Twoje zamówienia');
  await expect(customerPanel.locator('.innerbox')).toContainText('Adresy');
  await expect(customerPanel.locator('.innerbox')).toContainText('Dodaj adres');
  await expect(customerPanel.locator('.innerbox')).toContainText('Adres na fakturze');
  await expect(customerPanel.locator('.innerbox')).toContainText('Adres wysyłki');
  await expect(customerPanel.locator('.innerbox')).toContainText('Przejdź do edycji adresów');
});

// ─────────────────────────────────────────────
// TC_WKD_003 – Dodanie produktu do koszyka
// ─────────────────────────────────────────────
test('TC_WKD_003 – Weryfikacja dodawania produktu do koszyka', async ({ page }) => {
  await addClothingProductToBasket(page);

  const basketProduct = page.locator('#app .wk-product').filter({ hasText: CLOTHING_PRODUCT_NAME }).first();
  await expect(basketProduct).toBeVisible({ timeout: 20000 });
  await expect(basketProduct).toContainText('Rozmiar');
  await expect(basketProduct).toContainText('XS');
});

// ─────────────────────────────────────────────
// TC_WKD_004 – Usunięcie produktu z koszyka
// ─────────────────────────────────────────────
test('TC_WKD_004 – Weryfikacja usuwania produktów z koszyka', async ({ page }) => {
  test.slow();
  await prepareBasketWithSingleProduct(page);
  await clickFirstVisible(page, page.locator('#app .wk-remove button.remove'));
  await expect(page.locator('#app')).toContainText(/Twój koszyk jest pusty/i, { timeout: 10000 });
});

// ─────────────────────────────────────────────
// TC_WKD_005 – Przejdź do kasy
// ─────────────────────────────────────────────
test('TC_WKD_005 – Weryfikacja przekierowania do kasy', async ({ page }) => {
  test.slow();
  await addClothingProductToBasket(page);
  await clickFirstVisible(page, page.locator('#app .summary button.wkbtn.wk-black'));
  await expect(page).toHaveURL(/checkoutStep=2|checkout|order|delivery/);

  await clickFirstVisible(page, page.locator('label.shipping_99').filter({ hasText: /Kurier GLS/ }));
  await fillCheckoutAddress(page);

  await clickFirstVisible(page, page.locator('#additional_field_6'));
  await expect(page.locator('#Additional_Fields input[type="checkbox"][value="6"]')).toBeChecked();

  const submitOrder = page.locator('#app button.wkbtn.wk-black').filter({ hasText: /zam/i }).last();
  await expect(submitOrder).toBeVisible();

  await page.route('**/pl/basket**', async (route) => {
    if (route.request().method() === 'POST') {
      await route.abort();
      return;
    }

    await route.continue();
  });
  const orderRequest = page.waitForRequest((request) => {
    return request.method() === 'POST' && /\/pl\/basket\/?$/.test(new URL(request.url()).pathname);
  });

  await submitOrder.click();
  await expect.poll(async () => (await orderRequest).postData() || '', { timeout: 10000 }).toContain('payment_id=');
});

// ─────────────────────────────────────────────
// TC_WKD_006 – Zakładka NOWOŚCI
// ─────────────────────────────────────────────
test('TC_WKD_006 – Sprawdzenie poprawności linku „NOWOŚCI”', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('header a[href="/nowosci"], header a[href*="/nowosci"]'));
  await handleInitialModals(page);
  await expectProductListingLoaded(page, /nowosci/, /nowość/i);
});

// ─────────────────────────────────────────────
// TC_WKD_007 – Zakładka UBRANIA
// ─────────────────────────────────────────────
test('TC_WKD_007 – Sprawdzenie poprawności linku „UBRANIA”', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('header a[href="/ubrania"], header a[href*="/ubrania"]'));
  await handleInitialModals(page);
  await expectProductListingLoaded(page, /ubrania/, /ubrania|odzież|spodnie|bluza/i);
});

// ─────────────────────────────────────────────
// TC_WKD_008 – Link Regulamin w stopce
// ─────────────────────────────────────────────
test('TC_WKD_008 – Weryfikacja dostępu do regulaminu sklepu', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('footer a[href*="regulamin"]'));
  await handleInitialModals(page);
  await expect(page).toHaveURL(/regulamin/);
  await expect(page.locator('body')).toContainText(/regulamin/i);
});

// ─────────────────────────────────────────────
// TC_WKD_009 – Wyszukiwanie produktu „Białko”
// ─────────────────────────────────────────────
test('TC_WKD_009 – Weryfikacja działania wyszukiwarki sklepowej', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  
  const searchInput = await findFirstVisible(
    page,
    page.locator('form.js__search input[name="url"], input.search__input'),
    2000,
  );
  if (searchInput) {
  await searchInput.fill('Białko');
    await searchInput.press('Enter');
  } else {
    await page.goto('https://wkdzik.pl/new-search?url=Bia%C5%82ko', { waitUntil: 'domcontentloaded' });
  }

  await handleInitialModals(page);
  await expect(page).toHaveURL(/search/i);
  await expect(page.locator('.prodname').first()).toBeVisible();
  await expect(page.locator('body')).toContainText(/bia[łl]ko|whey|protein|odżywka/i);
});

// ─────────────────────────────────────────────
// TC_WKD_010 – Wyświetlanie ceny produktu
// ─────────────────────────────────────────────
test('TC_WKD_010 – Weryfikacja obecności ceny na stronie produktu', async ({ page }) => {
  await page.goto('https://wkdzik.pl/ubrania', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('.prodname'));
  await handleInitialModals(page);
  const productBox = page.locator('#box_productfull');
  await expect(productBox).toBeVisible({ timeout: 15000 });
  await expect(productBox.locator('.price-name').first()).toContainText(/Cena/i);
  await expect(productBox.locator('.main-price').first()).toHaveText(/\d+,\d{2}\s*zł/);
  expect(parseCurrency(await productBox.locator('.main-price').first().innerText())).toBeGreaterThan(0);
});

// ─────────────────────────────────────────────
// TC_WKD_011 – Linki do Social Media (Instagram)
// ─────────────────────────────────────────────
test('TC_WKD_011 – Weryfikacja odnośnika do profilu Instagram', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  const instaLink = page.locator('footer a[href*="instagram.com/wkdzik"]');
  await expect(instaLink).toBeVisible();
  await expect(instaLink).toHaveAttribute('href', /instagram\.com\/wkdzik/i);
});

// ─────────────────────────────────────────────
// TC_WKD_012 – Podstrona Kontakt
// ─────────────────────────────────────────────
test('TC_WKD_012 – Weryfikacja przejścia do formularza kontaktowego', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('footer a[href="/kontakt"], footer a[href*="/kontakt"]'));
  await handleInitialModals(page);
  await expect(page).toHaveURL(/kontakt/i);
  await expect(page.locator('body')).toContainText(/kontakt|e-mail|telefon|formularz/i);
});

// ─────────────────────────────────────────────
// TC_WKD_013 – Logowanie błąd (Niepoprawne dane)
// ─────────────────────────────────────────────
test('TC_WKD_013 – Weryfikacja obsługi błędnych danych logowania', async ({ page }) => {
  await page.goto('https://wkdzik.pl/pl/login', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await page.locator('#mail_input_long').fill('zle@email.pl');
  await page.locator('#pass_input_long').fill('jakieshaslo');
  await page.locator('.btn.btn-red.login').click();
  await expect(page.locator('body')).toContainText(/Niepoprawne dane logowania/i, { timeout: 10000 });
  await expect(page).toHaveURL(/\/pl\/login/);
  await expect(page.locator('a.myaccount[href*="/pl/panel"]').first()).toBeHidden();
});

// ─────────────────────────────────────────────
// TC_WKD_014 – Zakładka SUPLEMENTY
// ─────────────────────────────────────────────
test('TC_WKD_014 – Sprawdzenie poprawności linku „SUPLEMENTY”', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('header a[href="/suplementy"], header a[href*="/suplementy"]'));
  await handleInitialModals(page);
  await expectProductListingLoaded(page, /suplementy/, /suplement|kreatyna|cytrulina|whey|odżywka/i);
});

// ─────────────────────────────────────────────
// TC_WKD_015 – Zakładka AKCESORIA
// ─────────────────────────────────────────────
test('TC_WKD_015 – Sprawdzenie poprawności linku „AKCESORIA”', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('header a[href="/akcesoria"], header a[href*="/akcesoria"]'));
  await handleInitialModals(page);
  await expectProductListingLoaded(page, /akcesoria/, /akcesoria|kubek|shaker|czapka|skarpet/i);
});

// ─────────────────────────────────────────────
// TC_WKD_016 – Sortowanie po cenie rosnąco
// ─────────────────────────────────────────────
test('TC_WKD_016 – Weryfikacja sortowania produktów od najniższej ceny', async ({ page }) => {
  await page.goto('https://wkdzik.pl/ubrania', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await selectProductSort(page, '/ubrania/1/default/3');
  await expect(page).toHaveURL(/\/ubrania\/1\/default\/3|price_asc|cena_rosnaco/i);
  await expectListingPricesSorted(page, 'asc');
});

// ─────────────────────────────────────────────
// TC_WKD_017 – Sortowanie po cenie malejąco
// ─────────────────────────────────────────────
test('TC_WKD_017 – Weryfikacja sortowania produktów od najwyższej ceny', async ({ page }) => {
  await page.goto('https://wkdzik.pl/ubrania', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await selectProductSort(page, '/ubrania/1/default/4');
  await expect(page).toHaveURL(/\/ubrania\/1\/default\/4|price_desc|cena_malejaco/i);
  await expectListingPricesSorted(page, 'desc');
});

// ─────────────────────────────────────────────
// TC_WKD_018 – Filtrowanie po rozmiarze L
// ─────────────────────────────────────────────
test('TC_WKD_018 – Weryfikacja działania filtrów bocznych', async ({ page }) => {
  await page.goto('https://wkdzik.pl/ubrania', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await page.locator('text=Rozmiar').first().click();
  await page.waitForTimeout(500);
  await page.getByText(/^L$/).first().click();
  await page.waitForLoadState('domcontentloaded');
  await handleInitialModals(page);
  await expect(page).toHaveURL(/f_ov_32_308|filter_size|rozmiar/i);
  await expect(page.locator('.product.s-grid-3 .prodname').first()).toBeVisible({ timeout: 15000 });
  const filteredProducts = await getVisibleProductLinks(page, 3);
  await expectProductsHaveVariant(page, filteredProducts, 'L');
});

// ─────────────────────────────────────────────
// TC_WKD_019 – Newsletter walidacja pustego pola
// ─────────────────────────────────────────────
test('TC_WKD_019 – Sprawdzenie walidacji newslettera', async ({ page }) => {
  await exposeClosedShadowRoots(page);
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);

  const newsletterForm = page.locator('getresponse-form');
  await expect(newsletterForm).toBeVisible({ timeout: 20000 });
  await newsletterForm.scrollIntoViewIfNeeded();

  const emailInput = newsletterForm.locator('input[name="email"]');
  await expect(emailInput).toBeVisible({ timeout: 20000 });
  await expect(emailInput).toHaveValue('');

  await newsletterForm.locator('button[type="submit"]').click();

  await expect
    .poll(async () => {
      return emailInput.evaluate((input) => {
        let element: Element | null = input;

        for (let i = 0; i < 6 && element; i++) {
          if (element.textContent?.includes('To pole jest wymagane')) {
            return true;
          }

          element = element.parentElement;
        }

        return false;
      });
    }, { timeout: 10000 })
    .toBe(true);
});

// ─────────────────────────────────────────────
// TC_WKD_020 – Link Polityka Prywatności
// ─────────────────────────────────────────────
test('TC_WKD_020 – Weryfikacja dostępu do polityki prywatności', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('footer a[href*="polityka-prywatnosci"]'));
  await handleInitialModals(page);
  await expect(page).toHaveURL(/polityka-prywatnosci/);
  await expect(page.locator('body')).toContainText(/polityka prywatności|dane osobowe|RODO/i);
});

// ─────────────────────────────────────────────
// TC_WKD_021 – Link FAQ w stopce
// ─────────────────────────────────────────────
test('TC_WKD_021 – Weryfikacja sekcji FAQ', async ({ page }) => {
  await page.goto('https://wkdzik.pl/', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('footer a[href*="/faq"]'));
  await handleInitialModals(page);
  await expect(page).toHaveURL(/faq/);
  await expect(page.locator('body')).toContainText(/faq|pytania|odpowiedzi|pomoc/i);
});

// ─────────────────────────────────────────────
// TC_WKD_022 – Zmiana rozmiaru na karcie produktu
// ─────────────────────────────────────────────
test('TC_WKD_022 – Weryfikacja przełączania rozmiaru', async ({ page }) => {
  await openAvailableProductFromCategory(page, 'https://wkdzik.pl/ubrania', 'S');

  const sizeS = await clickProductVariant(page, 'S');
  await expect(sizeS).toHaveClass(/active|selected/);

  const sizeL = await clickProductVariant(page, 'L');
  await expect(sizeL).toHaveClass(/active|selected/);
});

// ─────────────────────────────────────────────
// TC_WKD_023 – Zmiana ilości produktu w koszyku
// ─────────────────────────────────────────────
test('TC_WKD_023 – Weryfikacja aktualizacji ilości w koszyku', async ({ page }) => {
  test.slow();
  await prepareBasketWithSingleProduct(page);
  await selectBasketQuantity(page, '2');
  await expect(page.locator('#app .basket_quantity_input .el-input__inner').first()).toHaveValue('2');
});

// ─────────────────────────────────────────────
// TC_WKD_024 – Przeliczenie sumy zamówienia
// ─────────────────────────────────────────────
test('TC_WKD_024 – Weryfikacja automatycznego przeliczania sumy', async ({ page }) => {
  test.slow();
  await prepareBasketWithSingleProduct(page);
  const productsTotalEl = page.locator('#app .summary strong').first();
  const singleProductsTotalText = await productsTotalEl.innerText();
  const singleProductsTotal = parseCurrency(singleProductsTotalText);
  await selectBasketQuantity(page, '2');
  await expect(productsTotalEl).not.toHaveText(singleProductsTotalText);
  await expect
    .poll(async () => parseCurrency(await productsTotalEl.innerText()), { timeout: 15000 })
    .toBeCloseTo(singleProductsTotal * 2, 2);
});

// ─────────────────────────────────────────────
// TC_WKD_025 – Powrót do strony głównej przez logo
// ─────────────────────────────────────────────
test('TC_WKD_025 – Logo jako link do home', async ({ page }) => {
  await page.goto('https://wkdzik.pl/nowosci', { waitUntil: 'domcontentloaded' });
  await handleInitialModals(page);
  await clickFirstVisible(page, page.locator('header .logo, header a[href="/"], header a[href*="wkdzik.pl"]'));
  await handleInitialModals(page);
  await expect(page).toHaveURL(/wkdzik.pl\/?$/);
  await expect(page.getByRole('link', { name: 'NOWOŚCI' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'UBRANIA' }).first()).toBeVisible();
});
