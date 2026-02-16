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

const dataSchema = z.object({
  id: z.union([z.string(), z.number()]).optional().nullable(),
  status: z.string().optional().nullable(),
  customer: customerSchema,
  product: productSchema.optional().nullable(),
  offer: offerSchema.optional().nullable(),
});

const webhookSchema = z.object({
  event: z.string(),
  secret: z.string(),
  id: z.union([z.string(), z.number()]).optional().nullable(),
  data: dataSchema,
});

export type CaktoWebhookPayload = z.infer<typeof webhookSchema>;

export function parseCaktoPayload(input: unknown) {
  return webhookSchema.parse(input);
}

export function normalizeId(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  return String(value);
}
