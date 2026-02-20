import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/current-user";
import { isAdminUser } from "@/lib/is-admin-user";

const updateProductSchema = z.object({
  slug: z.string().trim().min(2).max(80).optional(),
  title: z.string().trim().min(3).max(180).optional(),
  description: z.string().trim().max(600).optional().nullable(),
  type: z.enum(["EBOOK", "VIDEO_COURSE", "OTHER"]).optional(),
  active: z.boolean().optional(),
  landingSlug: z.string().trim().min(2).max(120).optional().nullable(),
  landingEnabled: z.boolean().optional(),
  landingConfig: z
    .object({
      badge: z.string().trim().max(120).optional().nullable(),
      headline: z.string().trim().max(220).optional().nullable(),
      subheadline: z.string().trim().max(220).optional().nullable(),
      description: z.string().trim().max(2000).optional().nullable(),
      priceLabel: z.string().trim().max(120).optional().nullable(),
      ctaLabel: z.string().trim().max(120).optional().nullable(),
      ctaUrl: z.string().trim().max(500).optional().nullable(),
      heroVideoUrl: z.string().trim().max(500).optional().nullable(),
      heroImageUrl: z.string().trim().max(500).optional().nullable(),
      primaryColor: z.string().trim().max(20).optional().nullable(),
      secondaryColor: z.string().trim().max(20).optional().nullable(),
      accentColor: z.string().trim().max(20).optional().nullable(),
      themeMode: z.enum(["light", "dark"]).optional().nullable(),
      animationsEnabled: z.boolean().optional().nullable(),
      bullets: z.array(z.string().trim().max(240)).max(20).optional().nullable(),
      carouselImages: z.array(z.string().trim().max(500)).max(20).optional().nullable(),
      testimonials: z
        .array(
          z.object({
            name: z.string().trim().max(120),
            text: z.string().trim().max(600),
          }),
        )
        .max(20)
        .optional()
        .nullable(),
      faq: z
        .array(
          z.object({
            question: z.string().trim().max(240),
            answer: z.string().trim().max(800),
          }),
        )
        .max(20)
        .optional()
        .nullable(),
      contentSections: z
        .array(
          z.object({
            title: z.string().trim().max(180),
            text: z.string().trim().max(1200),
            type: z.enum(["section", "benefit", "faq"]).optional(),
            imageUrl: z.string().trim().max(600).optional().nullable(),
          }),
        )
        .max(20)
        .optional()
        .nullable(),
      blocks: z
        .array(
          z.object({
            id: z.string().trim().max(120),
            type: z.enum(["hero", "text", "image", "video", "button", "carousel", "benefits", "faq", "input"]),
            title: z.string().trim().max(220).optional(),
            text: z.string().trim().max(4000).optional(),
            imageUrl: z.string().trim().max(1000).optional(),
            videoUrl: z.string().trim().max(1000).optional(),
            buttonLabel: z.string().trim().max(180).optional(),
            buttonUrl: z.string().trim().max(1000).optional(),
            placeholder: z.string().trim().max(240).optional(),
            items: z.array(z.string().trim().max(1200)).max(50).optional(),
            backgroundColor: z.string().trim().max(32).optional(),
            textColor: z.string().trim().max(32).optional(),
            animation: z.enum(["none", "fade", "slide-up", "slide-left", "slide-right", "zoom", "flip", "pop", "blur-in", "rotate-in", "float-in"]).optional(),
            animationDuration: z.number().min(0.2).max(2).optional(),
            animationDelay: z.number().min(0).max(0.8).optional(),
            texture: z.enum(["none", "grid", "dots", "diagonal", "noise"]).optional(),
            textureOpacity: z.number().min(0).max(70).optional(),
            widthMode: z.enum(["full", "wide", "normal", "narrow"]).optional(),
            paddingX: z.number().min(8).max(80).optional(),
            paddingY: z.number().min(8).max(96).optional(),
            radius: z.number().min(0).max(56).optional(),
            shadow: z.enum(["none", "soft", "medium", "hard"]).optional(),
            textAlign: z.enum(["left", "center", "right"]).optional(),
            titleSize: z.number().min(20).max(88).optional(),
            textSize: z.number().min(12).max(30).optional(),
            mediaFit: z.enum(["cover", "contain"]).optional(),
            mediaHeightDesktop: z.number().min(160).max(900).optional(),
            mediaHeightMobile: z.number().min(120).max(640).optional(),
            carouselAutoplay: z.boolean().optional(),
            carouselIntervalMs: z.number().min(1500).max(10000).optional(),
          }),
        )
        .max(80)
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),
});

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isAdminUser(user)) return NextResponse.json({ ok: false }, { status: 403 });

  const { productId } = await context.params;
  const body = await request.json().catch(() => null);
  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });

  const payload = parsed.data;
  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      slug: payload.slug,
      title: payload.title,
      description: payload.description ?? undefined,
      type: payload.type,
      active: payload.active,
      landingSlug: payload.landingSlug === null ? null : payload.landingSlug || undefined,
      landingEnabled: payload.landingEnabled,
      landingConfig:
        payload.landingConfig === null
          ? Prisma.DbNull
          : (payload.landingConfig as Prisma.InputJsonValue | undefined),
    },
    select: {
      id: true,
      slug: true,
      title: true,
      type: true,
      active: true,
      description: true,
      landingSlug: true,
      landingEnabled: true,
      landingConfig: true,
    },
  });

  return NextResponse.json({ ok: true, product: updated });
}
