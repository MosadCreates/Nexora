import { config } from "https://deno.land/x/dotenv/mod.ts";

const env = config({ path: ".env.local" });
const token = env.POLAR_ORGANIZATION_TOKEN;

if (!token) {
  console.error("POLAR_ORGANIZATION_TOKEN not found in .env.local");
  Deno.exit(1);
}

const response = await fetch("https://api.polar.sh/v1/products?is_archived=false", {
  headers: {
    "Authorization": `Bearer ${token}`,
  },
});

if (!response.ok) {
  console.error("Failed to fetch products:", await response.text());
  Deno.exit(1);
}

const data = await response.json();
console.log(JSON.stringify(data, null, 2));
