import seedProducts from "../../../public/seed-income-map.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PRODUCTION_API = "https://yookatale-server.onrender.com";

const incomeProducts = seedProducts.filter((product) => product.incomeLevel);

const normalize = (value) => String(value ?? "").trim().toLowerCase();
const keyFor = (product) => [
  normalize(product.name),
  normalize(product.category),
  normalize(product.price),
  normalize(product.quantity),
  normalize(product.unit),
].join("|");

const responseMessage = async (response) => {
  const text = await response.text();
  try {
    const body = JSON.parse(text);
    return body?.message || body?.error || text;
  } catch {
    return text || `HTTP ${response.status}`;
  }
};

async function loadProductionProducts(cookie) {
  const response = await fetch(`${PRODUCTION_API}/api/products`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(await responseMessage(response));
  const body = await response.json();
  return body?.data || [];
}

export async function GET(request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return Response.json({ message: "Authenticated admin session required" }, { status: 401 });

  const productionProducts = await loadProductionProducts(cookie);
  const byKey = new Map();
  for (const product of productionProducts) {
    const key = keyFor(product);
    const matches = byKey.get(key) || [];
    matches.push(product);
    byKey.set(key, matches);
  }

  const matched = incomeProducts.filter((seed) => (byKey.get(keyFor(seed)) || []).length === 1);
  const unmatched = incomeProducts.filter((seed) => !byKey.has(keyFor(seed)));
  const ambiguous = incomeProducts.filter((seed) => (byKey.get(keyFor(seed)) || []).length > 1);
  return Response.json({
    seedCount: incomeProducts.length,
    productionCount: productionProducts.length,
    matched: matched.length,
    unmatched: unmatched.map(({ name, category, price, quantity, unit, incomeLevel }) => ({ name, category, price, quantity, unit, incomeLevel })),
    ambiguous: ambiguous.map(({ name, category, price, quantity, unit }) => ({ name, category, price, quantity, unit })),
  });
}

export async function POST(request) {
  const cookie = request.headers.get("cookie");
  if (!cookie) return Response.json({ message: "Authenticated admin session required" }, { status: 401 });

  const productionProducts = await loadProductionProducts(cookie);
  const byKey = new Map();
  for (const product of productionProducts) {
    const key = keyFor(product);
    const matches = byKey.get(key) || [];
    matches.push(product);
    byKey.set(key, matches);
  }

  const unmatched = [];
  const ambiguous = [];
  const pending = [];
  for (const seed of incomeProducts) {
    const matches = byKey.get(keyFor(seed)) || [];
    if (matches.length === 0) unmatched.push(seed);
    else if (matches.length > 1) ambiguous.push(seed);
    else if (matches[0].incomeLevel !== seed.incomeLevel) pending.push({ seed, product: matches[0] });
  }

  const results = [];
  for (const { seed, product } of pending) {
    try {
      const form = new FormData();
      for (const [field, value] of Object.entries(product)) {
        if (!field.startsWith("_") && field !== "images" && value !== undefined && value !== null) form.set(field, String(value));
      }
      form.set("incomeLevel", seed.incomeLevel);
      const response = await fetch(`${PRODUCTION_API}/admin/product/edit/${product._id}`, {
        method: "PUT",
        headers: { cookie },
        body: form,
      });
      if (!response.ok) throw new Error(await responseMessage(response));
      results.push({ name: seed.name, incomeLevel: seed.incomeLevel, status: "updated" });
    } catch (error) {
      results.push({ name: seed.name, incomeLevel: seed.incomeLevel, status: "failed", error: error.message });
    }
  }

  return Response.json({
    seedCount: incomeProducts.length,
    productionCount: productionProducts.length,
    alreadyCorrect: incomeProducts.length - pending.length - unmatched.length - ambiguous.length,
    updated: results.filter((result) => result.status === "updated").length,
    failed: results.filter((result) => result.status === "failed").length,
    unmatched: unmatched.length,
    ambiguous: ambiguous.length,
    failures: results.filter((result) => result.status === "failed").slice(0, 20),
  });
}