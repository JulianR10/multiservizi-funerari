import { chromium } from "playwright";

const BASE = "http://localhost:3000";
const results = [];
let errors = 0;
let warnings = 0;
let passed = 0;
let failed = 0;

function report(label, ok, detail = "") {
  const status = ok ? "PASS" : "FAIL";
  if (ok) passed++;
  else failed++;
  results.push({ label, status, detail });
  const icon = ok ? "+" : "-";
  console.log(`${icon} ${status} | ${label}${detail ? "  -> " + detail : ""}`);
}

async function checkPage(page, url, label, checks = {}) {
  const consoleLogs = [];
  const failedReqs = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") consoleLogs.push(`[ERROR] ${msg.text()}`);
    if (msg.type() === "warning") consoleLogs.push(`[WARN] ${msg.text()}`);
  });
  page.on("requestfailed", (req) =>
    failedReqs.push(`${req.method()} ${req.url()} (${req.failure()?.errorText})`)
  );

  try {
    const res = await page.goto(BASE + url, {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    await page.waitForTimeout(500);

    // HTTP status
    const status = res?.status() || 0;
    report(label + " HTTP", status < 400, `status ${status}`);

    // Console errors
    const errMsgs = consoleLogs.filter((l) => l.startsWith("[ERROR]"));
    const warnMsgs = consoleLogs.filter((l) => l.startsWith("[WARN]"));
    if (errMsgs.length > 0)
      report(
        label + " JS Errors",
        false,
        `${errMsgs.length} errors: ${errMsgs.slice(0, 3).join(" | ")}`
      );
    else report(label + " JS Errors", true, "none");
    errors += errMsgs.length;
    warnings += warnMsgs.length;

    // Failed network requests
    if (failedReqs.length > 0)
      report(
        label + " Network",
        failedReqs.length === 0,
        `${failedReqs.length} failed: ${failedReqs.slice(0, 2).join(" | ")}`
      );
    else report(label + " Network", true, "none");

    // Custom element checks
    for (const [desc, selector] of Object.entries(checks)) {
      try {
        const el = await page.$(selector);
        report(label + " > " + desc, !!el, !el ? "not found" : "");
      } catch (e) {
        report(label + " > " + desc, false, e.message);
      }
    }

    return page;
  } catch (e) {
    report(label, false, e.message);
    return page;
  }
}

(async () => {
  console.log("=== QA Report — Petrungaro Multiservizi ===\n");
  const start = Date.now();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  // --- LANDING ---
  let page = await context.newPage();
  await checkPage(page, "/", "Landing (/ )", {
    "Hero section": "section h1",
    "Chi Siamo": "h2:has-text('Chi Siamo')",
    "Servizi section": "h2:has-text('Servizi')",
    "Contatti section": "h2:has-text('Contatti')",
  });
  await page.close();

  // --- CATALOG ---
  page = await context.newPage();
  await checkPage(page, "/prodotti", "Catalogo (/prodotti)", {
    "CategoryGrid": "[class*='CategoryGrid'], div.flex.flex-wrap, a[href*='prodotti?category']",
    "Search bar": "input[type='search'], input[placeholder*='erca']",
    "Product count": "text=/\\d+ prodotti/i",
    "Product cards": "a[href*='/prodotti/']",
  });
  await page.close();

  // --- CATEGORY FILTER ---
  page = await context.newPage();
  await checkPage(
    page,
    "/prodotti?category=articoli-funebri",
    "Catalogo filtrato (/prodotti?category=articoli-funebri)",
    {}
  );
  await page.close();

  // --- PRODUCT DETAIL ---
  page = await context.newPage();
  const catalogPage = await context.newPage();
  await catalogPage.goto(BASE + "/prodotti", { waitUntil: "networkidle" });
  await catalogPage.waitForTimeout(500);
  const productLink = await catalogPage.$("a[href*='/prodotti/'][href$='-']");
  let slug = "vite-a-croce-finitura-ottone-lucido";
  if (productLink) {
    const href = await productLink.getAttribute("href");
    slug = href.split("/prodotti/")[1];
  }
  await catalogPage.close();
  await checkPage(page, `/prodotti/${slug}`, `Prodotto (/prodotti/${slug})`, {
    "Product name (h1)": "h1",
    "Image gallery": "img",
  });
  await page.close();

  // --- CART (empty) ---
  page = await context.newPage();
  await checkPage(page, "/carrello", "Carrello vuoto (/carrello)", {
    "Cart page heading": "h1",
  });
  await page.close();

  // --- AUTH LOGIN ---
  page = await context.newPage();
  await checkPage(page, "/auth/login", "Login (/auth/login)", {
    "Login form": "form",
    "Email field": "input[type='email']",
    "Password field": "input[type='password']",
  });
  await page.close();

  // --- AUTH REGISTER ---
  page = await context.newPage();
  await checkPage(page, "/auth/register", "Registro (/auth/register)", {
    "Register form": "form",
    "Ragione Sociale": "input[id*='ragione'], input[name*='company'], input[id*='azienda']",
  });
  await page.close();

  // --- TRACKING ---
  page = await context.newPage();
  await checkPage(page, "/track", "Tracking (/track)", {
    "Email input": "input[type='email']",
  });
  await page.close();

  // --- ADMIN ---
  page = await context.newPage();
  await checkPage(page, "/admin", "Admin (/admin)", {
    "Redirect to login": "form, input[type='email']",
  });
  await page.close();

  // --- LEGAL PAGES ---
  const legalPages = [
    ["/termini", "Termini e Condizioni"],
    ["/privacy", "Privacy Policy"],
    ["/cookies", "Cookie Policy"],
    ["/recesso", "Diritto di Recesso"],
    ["/dati-societari", "Dati Societari"],
  ];
  for (const [url, name] of legalPages) {
    const lp = await context.newPage();
    await checkPage(lp, url, `Legale (${url})`, {
      "Content heading": "h1",
    });
    await lp.close();
  }

  // --- 404 ---
  page = await context.newPage();
  await checkPage(page, "/pagina-che-non-esiste", "404 (/pagina-che-non-esiste)", {
    "404 or redirect": "h1, a",
  });
  await page.close();

  // --- REPORT ---
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Passed: ${passed}  Failed: ${failed}  Time: ${elapsed}s`);
  console.log(`JS Errors: ${errors}  JS Warnings: ${warnings}`);
  console.log(`Total pages checked: 15`);
  if (failed > 0) {
    console.log(`\nFAILED:`);
    results
      .filter((r) => r.status === "FAIL")
      .forEach((r) => console.log(`  ${r.label}: ${r.detail}`));
  }

  await browser.close();
})();
