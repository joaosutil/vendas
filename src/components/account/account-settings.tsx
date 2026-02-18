"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type AccountSettingsProps = {
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    alertsEnabled: boolean;
  };
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const router = useRouter();
  const [name, setName] = useState(user.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [avatarUrlInput, setAvatarUrlInput] = useState(user.avatarUrl ?? "");
  const [alertsEnabled, setAlertsEnabled] = useState(user.alertsEnabled);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) return null;
    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  function isValidAvatarUrl(value: string) {
    const normalized = value.trim();
    if (!normalized) return true;
    if (normalized.startsWith("/uploads/avatars/")) return true;
    try {
      const parsed = new URL(normalized);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }

  async function parseApiResponse(response: Response) {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json().catch(() => ({}));
    }
    const text = await response.text().catch(() => "");
    return { ok: false, error: text || "Resposta inválida do servidor." };
  }

  async function optimizeAvatarFile(file: File) {
    if (file.size <= 900 * 1024) return file;
    const imageUrl = URL.createObjectURL(file);
    try {
      const img = document.createElement("img");
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Falha ao carregar imagem"));
        img.src = imageUrl;
      });

      const maxWidth = 1024;
      const scale = Math.min(1, maxWidth / Math.max(img.width, 1));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context) return file;
      context.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/webp", 0.82);
      });
      if (!blob) return file;
      if (blob.size > 950 * 1024) {
        const secondBlob = await new Promise<Blob | null>((resolve) => {
          canvas.toBlob((result) => resolve(result), "image/jpeg", 0.72);
        });
        if (secondBlob) {
          return new File([secondBlob], `${file.name.replace(/\.[^.]+$/, "")}-optimized.jpg`, {
            type: "image/jpeg",
          });
        }
      }

      return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-optimized.webp`, { type: "image/webp" });
    } finally {
      URL.revokeObjectURL(imageUrl);
    }
  }

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
    };
  }, [avatarPreviewUrl]);

  async function saveProfile() {
    setLoading(true);
    setFeedback(null);
    setError(null);
    try {
      if (!isValidAvatarUrl(avatarUrlInput)) {
        setError("URL de foto inválida. Use um link http(s) válido.");
        return;
      }
      const response = await fetch("/api/members/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl: avatarUrlInput.trim(), alertsEnabled }),
      });
      const data = (await parseApiResponse(response)) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Falha ao salvar perfil.");
        return;
      }
      setAvatarUrl(avatarUrlInput.trim());
      setFeedback("Perfil atualizado com sucesso.");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar() {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    setFeedback(null);
    setError(null);
    try {
      const optimized = await optimizeAvatarFile(avatarFile);
      if (optimized.size > 1024 * 1024) {
        setError("Imagem muito grande para upload. Use uma imagem menor que 1MB.");
        return;
      }
      const formData = new FormData();
      formData.set("avatar", optimized);
      const response = await fetch("/api/members/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = (await parseApiResponse(response)) as { ok?: boolean; error?: string; avatarUrl?: string };
      if (!response.ok || !data.ok || !data.avatarUrl) {
        if (response.status === 413) {
          setError("Imagem excedeu o limite de upload do servidor. Escolha uma imagem menor.");
          return;
        }
        setError(data.error ?? "Falha ao enviar imagem.");
        return;
      }
      setAvatarUrl(data.avatarUrl);
      setAvatarUrlInput(data.avatarUrl);
      setAvatarFile(null);
      setFeedback("Avatar enviado com sucesso.");
      router.refresh();
    } finally {
      setUploadingAvatar(false);
    }
  }

  async function changePassword() {
    setLoading(true);
    setFeedback(null);
    setError(null);
    try {
      const response = await fetch("/api/members/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      const data = (await parseApiResponse(response)) as { ok?: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Falha ao alterar senha.");
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFeedback("Senha alterada com sucesso.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-white/60 bg-white/75 p-5">
        <h1 className="text-3xl font-bold">Conta e Preferências</h1>
        <p className="mt-1 text-sm text-[var(--carvao)]/80">
          Gerencie foto de perfil, alertas e credenciais de acesso.
        </p>
      </div>

      {feedback ? <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-800">{feedback}</div> : null}
      {error ? <div className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="text-lg font-semibold">Perfil</h2>
          <div className="mt-3 flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={avatarUrl || "/brand-icon.png"} alt="Avatar" className="h-16 w-16 rounded-full border border-[var(--dourado)]/40 object-cover" />
            <div className="text-sm">
              <p className="font-semibold">{name || "Sem nome"}</p>
              <p className="text-[var(--carvao)]/75">{user.email}</p>
            </div>
          </div>

          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome"
            className="mt-3 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
          />
          <input
            value={avatarUrlInput}
            onChange={(event) => setAvatarUrlInput(event.target.value)}
            placeholder="URL da foto (https://...)"
            className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
          />
          <label className="mt-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={alertsEnabled}
              onChange={(event) => setAlertsEnabled(event.target.checked)}
            />
            Receber alertas e notificações da plataforma
          </label>

          <button
            type="button"
            onClick={saveProfile}
            disabled={loading}
            className="mt-3 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            Salvar perfil
          </button>
        </article>

        <article className="rounded-2xl border border-white/60 bg-white/75 p-4">
          <h2 className="text-lg font-semibold">Foto por arquivo</h2>
          <p className="mt-1 text-sm text-[var(--carvao)]/75">Clique na área abaixo para escolher o arquivo da foto e depois clique em &quot;Enviar foto&quot;.</p>
          <div className="mt-3 rounded-xl border border-[var(--dourado)]/40 bg-white p-3">
            <label className="block text-xs font-semibold text-[var(--carvao)]/75">Arquivo (JPG, PNG, WEBP • recomendado até 1MB)</label>
            <input
              id="avatar-file-input"
              type="file"
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              className="sr-only"
            />
            <label
              htmlFor="avatar-file-input"
              className="mt-2 flex min-h-24 w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-[var(--dourado)]/50 bg-[var(--creme)]/55 px-4 text-center text-sm font-semibold text-[var(--carvao)]/85 transition hover:bg-[var(--creme)]/80"
            >
              {avatarFile ? "Arquivo selecionado. Clique para trocar." : "Clique aqui para escolher o arquivo da foto"}
            </label>
            <input
              value={avatarUrlInput}
              onChange={(event) => setAvatarUrlInput(event.target.value)}
              placeholder="Ou cole aqui a URL da imagem"
              className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
            />
            {avatarFile ? (
              <div className="mt-3 rounded-lg border border-[var(--dourado)]/30 bg-[var(--creme)]/65 p-2">
                <p className="text-xs">
                  <strong>Selecionado:</strong> {avatarFile.name}
                </p>
                <p className="text-xs text-[var(--carvao)]/75">
                  Tamanho: {(avatarFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
                {avatarPreviewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreviewUrl} alt="Previa do avatar" className="mt-2 h-20 w-20 rounded-full border border-[var(--dourado)]/35 object-cover" />
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-xs text-[var(--carvao)]/70">Nenhum arquivo selecionado.</p>
            )}
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={uploadAvatar}
                disabled={uploadingAvatar || !avatarFile}
                className="rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {uploadingAvatar ? "Enviando..." : "Enviar foto"}
              </button>
              <button
                type="button"
                onClick={() => setAvatarFile(null)}
                disabled={uploadingAvatar || !avatarFile}
                className="rounded-lg border border-[var(--ink)]/30 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)] disabled:opacity-60"
              >
                Limpar
              </button>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-white/60 bg-white/75 p-4">
        <h2 className="text-lg font-semibold">Segurança</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Senha atual"
            className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Nova senha"
            className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirmar nova senha"
            className="rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
          />
        </div>
        <button
          type="button"
          onClick={changePassword}
          disabled={loading || !currentPassword || !newPassword || !confirmPassword}
          className="mt-3 rounded-lg bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          Alterar senha
        </button>
      </article>

      <form action="/api/auth/logout" method="post">
        <button type="submit" className="rounded-xl border border-[var(--ink)]/30 bg-white px-4 py-2 text-sm font-semibold text-[var(--ink)]">
          Sair da conta
        </button>
      </form>
    </section>
  );
}
