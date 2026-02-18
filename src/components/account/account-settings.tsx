"use client";

import { useEffect, useMemo, useState } from "react";

type AccountSettingsProps = {
  user: {
    name: string | null;
    email: string;
    avatarUrl: string | null;
    alertsEnabled: boolean;
  };
};

export function AccountSettings({ user }: AccountSettingsProps) {
  const [name, setName] = useState(user.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
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
      const response = await fetch("/api/members/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, avatarUrl, alertsEnabled }),
      });
      const data = (await response.json()) as { ok: boolean; error?: string };
      if (!response.ok || !data.ok) {
        setError(data.error ?? "Falha ao salvar perfil.");
        return;
      }
      setFeedback("Perfil atualizado com sucesso.");
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
      const formData = new FormData();
      formData.set("avatar", avatarFile);
      const response = await fetch("/api/members/account/avatar", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { ok: boolean; error?: string; avatarUrl?: string };
      if (!response.ok || !data.ok || !data.avatarUrl) {
        setError(data.error ?? "Falha ao enviar imagem.");
        return;
      }
      setAvatarUrl(data.avatarUrl);
      setAvatarFile(null);
      setFeedback("Avatar enviado com sucesso.");
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
      const data = (await response.json()) as { ok: boolean; error?: string };
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
            <img
              src={avatarUrl || "/brand-icon.png"}
              alt="Avatar"
              className="h-16 w-16 rounded-full border border-[var(--dourado)]/40 object-cover"
            />
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
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
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
          <p className="mt-1 text-sm text-[var(--carvao)]/75">Selecione uma imagem e clique em &quot;Enviar foto&quot;.</p>
          <div className="mt-3 rounded-xl border border-[var(--dourado)]/40 bg-white p-3">
            <label className="block text-xs font-semibold text-[var(--carvao)]/75">Arquivo (JPG, PNG, WEBP • até 3MB)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
              onChange={(event) => setAvatarFile(event.target.files?.[0] ?? null)}
              className="mt-2 block w-full text-sm"
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
