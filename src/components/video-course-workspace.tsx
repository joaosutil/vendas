"use client";

import { useEffect, useMemo, useState } from "react";

type VideoCourseWorkspaceProps = {
  slug: string;
  title: string;
  description?: string | null;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
      description?: string;
      videoUrl: string;
    }>;
  }>;
};

function getEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (parsed.hostname.includes("vimeo.com")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  } catch {
    return url;
  }
}

export function VideoCourseWorkspace({ slug, title, description, modules }: VideoCourseWorkspaceProps) {
  const allLessons = useMemo(
    () =>
      modules.flatMap((module) =>
        module.lessons.map((lesson) => ({
          ...lesson,
          moduleTitle: module.title,
        })),
      ),
    [modules],
  );

  const [activeLessonId, setActiveLessonId] = useState<string>(() => {
    if (typeof window === "undefined") return allLessons[0]?.id ?? "";
    const lastLessonId = window.localStorage.getItem(`video-last-lesson:${slug}`);
    if (lastLessonId && allLessons.some((lesson) => lesson.id === lastLessonId)) return lastLessonId;
    return allLessons[0]?.id ?? "";
  });
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [moduleFilter, setModuleFilter] = useState("");
  const [lessonNotes, setLessonNotes] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    const noteRaw = window.localStorage.getItem(`video-notes:${slug}`);
    if (!noteRaw) return {};
    try {
      return JSON.parse(noteRaw) as Record<string, string>;
    } catch {
      return {};
    }
  });

  useEffect(() => {
    if (!activeLessonId) return;
    window.localStorage.setItem(`video-last-lesson:${slug}`, activeLessonId);
  }, [activeLessonId, slug]);

  useEffect(() => {
    if (!Object.keys(lessonNotes).length) return;
    window.localStorage.setItem(`video-notes:${slug}`, JSON.stringify(lessonNotes));
  }, [lessonNotes, slug]);

  useEffect(() => {
    async function loadProgress() {
      try {
        const response = await fetch(`/api/members/video-courses/${slug}/progress`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { completedLessonIds?: string[] };
        const next: Record<string, boolean> = {};
        for (const lessonId of data.completedLessonIds ?? []) {
          next[lessonId] = true;
        }
        setCompleted(next);
      } catch {
        // silent fail to not break study flow
      }
    }

    loadProgress();
  }, [slug]);

  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) ?? allLessons[0];
  const activeIndex = allLessons.findIndex((lesson) => lesson.id === activeLesson?.id);
  const previousLesson = activeIndex > 0 ? allLessons[activeIndex - 1] : null;
  const nextLesson = activeIndex >= 0 && activeIndex < allLessons.length - 1 ? allLessons[activeIndex + 1] : null;
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const modulesFiltered = modules
    .map((module) => ({
      ...module,
      lessons: module.lessons.filter(
        (lesson) =>
          !moduleFilter.trim() ||
          lesson.title.toLowerCase().includes(moduleFilter.toLowerCase()) ||
          module.title.toLowerCase().includes(moduleFilter.toLowerCase()),
      ),
    }))
    .filter((module) => module.lessons.length > 0);

  async function toggleDone(lessonId: string) {
    const nextCompleted = !completed[lessonId];
    setCompleted((prev) => ({ ...prev, [lessonId]: nextCompleted }));
    try {
      await fetch(`/api/members/video-courses/${slug}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, completed: nextCompleted }),
      });
    } catch {
      // keep optimistic state even if request fails
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--dourado)]/40 bg-white/80 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
          <div className="flex gap-2">
            <span className="rounded-full border border-[var(--dourado)]/50 bg-white px-3 py-1 text-xs font-semibold">
              {modules.length} módulos
            </span>
            <span className="rounded-full border border-[var(--dourado)]/50 bg-white px-3 py-1 text-xs font-semibold">
              {allLessons.length} aulas
            </span>
            <span className="rounded-full border border-emerald-400/60 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              {completedCount} concluídas
            </span>
          </div>
        </div>
        {description ? <p className="mt-2 text-sm text-[var(--carvao)]/80">{description}</p> : null}
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-[var(--dourado)]/25">
          <div className="h-3 rounded-full bg-[var(--ink)] transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-xs text-[var(--carvao)]/75">Progresso: {progress}%</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <article className="rounded-2xl border border-white/60 bg-white/80 p-3">
          {activeLesson ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">{activeLesson.moduleTitle}</p>
              <h2 className="mt-1 text-xl font-bold">{activeLesson.title}</h2>
              <div className="mt-3 overflow-hidden rounded-xl border border-[var(--dourado)]/35">
                <iframe
                  title={activeLesson.title}
                  src={getEmbedUrl(activeLesson.videoUrl)}
                  className="h-[46vh] w-full md:h-[60vh]"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <button
                type="button"
                onClick={() => toggleDone(activeLesson.id)}
                className="mt-3 rounded-md bg-[var(--ink)] px-3 py-2 text-sm font-semibold text-white"
              >
                {completed[activeLesson.id] ? "Marcar como não concluída" : "Marcar como concluída"}
              </button>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={!previousLesson}
                  onClick={() => previousLesson && setActiveLessonId(previousLesson.id)}
                  className="rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  Aula anterior
                </button>
                <button
                  type="button"
                  disabled={!nextLesson}
                  onClick={() => nextLesson && setActiveLessonId(nextLesson.id)}
                  className="rounded-md border border-[var(--dourado)]/45 bg-white px-3 py-2 text-xs font-semibold disabled:opacity-50"
                >
                  Próxima aula
                </button>
              </div>
              {activeLesson.description ? (
                <div className="mt-3 rounded-lg border border-[var(--dourado)]/35 bg-[var(--creme)]/60 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Descrição da aula</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--carvao)]/85">{activeLesson.description}</p>
                </div>
              ) : null}
              <div className="mt-3 rounded-lg border border-[var(--dourado)]/35 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--carvao)]/70">Minhas anotações</p>
                <textarea
                  value={lessonNotes[activeLesson.id] ?? ""}
                  onChange={(event) =>
                    setLessonNotes((prev) => ({
                      ...prev,
                      [activeLesson.id]: event.target.value,
                    }))
                  }
                  rows={5}
                  placeholder="Escreva os pontos-chave desta aula..."
                  className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-sm"
                />
              </div>
            </>
          ) : (
            <p className="text-sm text-[var(--carvao)]/75">Nenhuma aula cadastrada ainda.</p>
          )}
        </article>

        <aside className="rounded-2xl border border-white/60 bg-white/80 p-3">
          <h3 className="font-semibold">Trilha de estudo</h3>
          <input
            value={moduleFilter}
            onChange={(event) => setModuleFilter(event.target.value)}
            className="mt-2 w-full rounded-lg border border-[var(--dourado)]/45 bg-white px-3 py-2 text-xs"
            placeholder="Filtrar módulo/aula"
          />
          <div className="mt-3 space-y-3">
            {modulesFiltered.length === 0 ? (
              <p className="text-sm text-[var(--carvao)]/70">Sem módulos por enquanto.</p>
            ) : (
              modulesFiltered.map((module) => (
                <div key={module.id} className="rounded-lg border border-[var(--dourado)]/35 bg-[var(--creme)]/55 p-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{module.title}</p>
                    <span className="text-[11px] text-[var(--carvao)]/75">
                      {module.lessons.filter((lesson) => completed[lesson.id]).length}/{module.lessons.length}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white">
                    <div
                      className="h-1.5 rounded-full bg-[var(--ink)]"
                      style={{
                        width: `${module.lessons.length ? Math.round((module.lessons.filter((lesson) => completed[lesson.id]).length / module.lessons.length) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <div className="mt-2 space-y-1">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => setActiveLessonId(lesson.id)}
                        className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-left text-xs ${
                          lesson.id === activeLessonId ? "bg-[var(--ink)] text-white" : "bg-white/80"
                        }`}
                      >
                        <span className="line-clamp-1">{lesson.title}</span>
                        <span>{completed[lesson.id] ? "✓" : "•"}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
