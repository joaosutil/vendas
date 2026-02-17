import { z } from "zod";

const customerSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().nullable(),
});

const productSchema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
});

const offerSchema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
});

const dataSchema = z
  .object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.string().optional().nullable(),
  customer: customerSchema,
  product: productSchema.optional().nullable(),
  offer: offerSchema.optional().nullable(),
  })
  .passthrough();

const webhookSchema = z
  .object({
    event: z.string(),
    secret: z.string(),
    id: z.union([z.string(), z.number()]).optional().nullable(),
    data: dataSchema,
  })
  .passthrough();

export type CaktoWebhookPayload = z.infer<typeof webhookSchema>;

export function parseCaktoPayload(input: unknown) {
  return webhookSchema.parse(input);
}

export function normalizeId(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  return String(value);
}

function getByPath(source: unknown, path: string) {
  const steps = path.split(".");
  let current: unknown = source;
  for (const step of steps) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[step];
  }
  return current;
}

function toCents(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value > 0 && value < 1000) return Math.round(value * 100);
    return Math.round(value);
  }
  if (typeof value === "string") {
    const normalized = value.replace(/\s/g, "").replace(/\./g, "").replace(",", ".");
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    if (parsed > 0 && parsed < 1000) return Math.round(parsed * 100);
    return Math.round(parsed);
  }
  return null;
}

function normalizePaymentMethod(value: unknown) {
  if (typeof value !== "string") return null;
  const raw = value.trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("pix")) return "PIX";
  if (raw.includes("boleto")) return "BOLETO";
  if (raw.includes("cart") || raw.includes("credit") || raw.includes("card")) return "CARTAO";
  return raw.toUpperCase();
}

export function extractCaktoFinancialData(payload: CaktoWebhookPayload) {
  const rawData = payload.data as unknown as Record<string, unknown>;
  const methodCandidatePaths = [
    "paymentMethod",
    "payment_method",
    "payment.method",
    "payment.type",
    "paymentType",
    "method",
    "billing_type",
  ];
  const grossCandidatePaths = [
    "amount",
    "total",
    "totalAmount",
    "grossAmount",
    "gross_amount",
    "price",
    "payment.amount",
  ];
  const feeCandidatePaths = [
    "feeAmount",
    "fee_amount",
    "fees",
    "tax",
    "taxAmount",
    "gatewayFee",
    "payment.fee",
  ];
  const netCandidatePaths = ["netAmount", "net_amount", "liquidAmount", "payment.net"];
  const currencyCandidatePaths = ["currency", "payment.currency", "transaction.currency"];

  const methodValue = methodCandidatePaths.map((path) => getByPath(rawData, path)).find((entry) => entry !== undefined);
  const grossValue = grossCandidatePaths.map((path) => getByPath(rawData, path)).find((entry) => entry !== undefined);
  const feeValue = feeCandidatePaths.map((path) => getByPath(rawData, path)).find((entry) => entry !== undefined);
  const netValue = netCandidatePaths.map((path) => getByPath(rawData, path)).find((entry) => entry !== undefined);
  const currencyValue = currencyCandidatePaths.map((path) => getByPath(rawData, path)).find((entry) => entry !== undefined);

  return {
    paymentMethod: normalizePaymentMethod(methodValue),
    grossAmountCents: toCents(grossValue),
    feeAmountCents: toCents(feeValue),
    netAmountCents: toCents(netValue),
    currency: typeof currencyValue === "string" ? currencyValue.toUpperCase() : "BRL",
    paymentMeta: {
      methodRaw: methodValue ?? null,
      grossRaw: grossValue ?? null,
      feeRaw: feeValue ?? null,
      netRaw: netValue ?? null,
      currencyRaw: currencyValue ?? null,
    },
  };
}
