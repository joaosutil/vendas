import { Resend } from "resend";

const FROM = process.env.EMAIL_FROM ?? "Marketing Digital Top <no-reply@seudominio.com>";
const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://seudominio.com";
const EMAIL_COVER_IMAGE_URL = process.env.EMAIL_COVER_IMAGE_URL?.trim();

type SetupPasswordInput = {
  email: string;
  name?: string | null;
  setupUrl: string;
};

type PasswordEmailMode = "first_access" | "recovery";

function buildPasswordEmail(input: SetupPasswordInput, mode: PasswordEmailMode) {
  const greetingName = input.name?.trim() || "tudo bem";
  const coverImageUrl =
    EMAIL_COVER_IMAGE_URL || `${APP_BASE_URL.replace(/\/+$/, "")}/ebook-cover-art.png`;
  const isRecovery = mode === "recovery";

  const subject = isRecovery ? "Redefina sua senha 🔐" : "Seu acesso está liberado ✅";
  const title = isRecovery ? "Redefina sua senha" : "Seu acesso foi liberado";
  const intro = isRecovery
    ? "Recebemos uma solicitação para redefinir sua senha da área de membros."
    : "Seu pagamento foi confirmado e seu acesso ao Como Derrotar a Ansiedade já está disponível.";
  const buttonText = isRecovery ? "REDEFINIR SENHA" : "DEFINIR SENHA E ACESSAR";
  const preHeader = isRecovery
    ? "Link para redefinir sua senha da área de membros."
    : "Seu pagamento foi confirmado. Clique para definir sua senha e acessar sua área de membros.";

  const apiKey = process.env.RESEND_API_KEY;
  const html = `
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      ${preHeader}
    </div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4efe6;padding:28px 0;font-family:Arial,Helvetica,sans-serif;">
      <tr>
        <td align="center">
          <table role="presentation" width="640" cellspacing="0" cellpadding="0" style="width:640px;max-width:94%;background:#ffffff;border:1px solid #eadbc0;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:linear-gradient(120deg,#e0c392,#f7f6f4);padding:24px 28px;">
                <div style="font-size:14px;color:#3b393c;opacity:.85;">Marketing Digital Top</div>
                <h1 style="margin:10px 0 0 0;font-size:28px;line-height:1.2;color:#0d111c;">${title}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px 8px 28px;color:#3b393c;">
                <p style="margin:0 0 12px 0;font-size:16px;line-height:1.5;">Oi, <strong>${greetingName}</strong>!</p>
                <p style="margin:0 0 14px 0;font-size:15px;line-height:1.65;">
                  ${intro}
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 28px 6px 28px;">
                <img src="${coverImageUrl}" alt="Capa do eBook Como Derrotar a Ansiedade" width="240" style="display:block;width:240px;max-width:88%;height:auto;border-radius:12px;border:1px solid #eadbc0;" />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:22px 28px 8px 28px;">
                <a href="${input.setupUrl}" style="display:inline-block;padding:14px 24px;background:#0d111c;color:#ffffff;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:.2px;">
                  ${buttonText}
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding:14px 28px 8px 28px;color:#3b393c;">
                <div style="background:#f7f6f4;border:1px solid #eadbc0;border-radius:10px;padding:12px 14px;font-size:13px;line-height:1.6;">
                  <strong>Dica:</strong> se não encontrar este e-mail na caixa de entrada, verifique as abas <strong>Spam</strong> e <strong>Promoções</strong>.
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px 26px 28px;color:#7d6a5a;font-size:12px;line-height:1.6;">
                Este link é pessoal e foi enviado para <strong>${input.email}</strong>.
                <br />
                Se você não solicitou esta ação, ignore esta mensagem.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
  const text = isRecovery
    ? `Oi, ${greetingName}!\n\nRecebemos uma solicitação para redefinir sua senha.\n\nUse este link:\n${input.setupUrl}\n\nSe você não solicitou, ignore este e-mail.`
    : `Oi, ${greetingName}!\n\nSeu pagamento foi confirmado e seu acesso ao Como Derrotar a Ansiedade já está disponível.\n\nDefina sua senha e acesse:\n${input.setupUrl}\n\nSe não encontrar este e-mail, verifique Spam/Promoções.`;

  return { apiKey, subject, html, text };
}

export async function sendSetupPasswordEmail(input: SetupPasswordInput) {
  const { apiKey, subject, html, text } = buildPasswordEmail(input, "first_access");

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
    text,
  });
}

export async function sendPasswordRecoveryEmail(input: SetupPasswordInput) {
  const { apiKey, subject, html, text } = buildPasswordEmail(input, "recovery");

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
    text,
  });
}
