import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Marketing Digital Top <no-reply@seudominio.com>";

type SetupPasswordInput = {
  email: string;
  name?: string | null;
  setupUrl: string;
};

export async function sendSetupPasswordEmail(input: SetupPasswordInput) {
  const apiKey = process.env.RESEND_API_KEY;
  const subject = "Seu acesso está liberado ✅";
  const html = `
    <p>Oi, ${input.name?.trim() || "tudo bem"}!</p>
    <p>Seu pagamento foi confirmado e seu acesso ao <strong>Como Derrotar a Ansiedade</strong> já está disponível.</p>
    <p><a href="${input.setupUrl}" style="display:inline-block;padding:12px 20px;background:#0D111C;color:#fff;border-radius:8px;text-decoration:none;">ACESSAR ÁREA DE MEMBROS</a></p>
    <p>Se não encontrar este e-mail, confira Spam/Promoções.</p>
  `;

  if (!apiKey) {
    console.info("[EMAIL:FALLBACK]", { to: input.email, subject, setupUrl: input.setupUrl });
    return;
  }

  const resend = new Resend(apiKey);
  await resend.emails.send({
    from: FROM,
    to: input.email,
    subject,
    html,
  });
}
