"use client";

import { useMemo, useState } from "react";

type VideoCourseWorkspaceProps = {
  title: string;
  description?: string | null;
  modules: Array<{
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
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

export function VideoCourseWorkspace({ title, description, modules }: VideoCourseWorkspaceProps) {
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

  const [activeLessonId, setActiveLessonId] = useState<string>(allLessons[0]?.id ?? "");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) ?? allLessons[0];
  const completedCount = Object.values(completed).filter(Boolean).length;
  const progress = allLessons.length ? Math.round((completedCount / allLessons.length) * 100) : 0;

  function toggleDone(lessonId: string) {
    setCompleted((prev) => ({ ...prev, [lessonId]: !prev[lessonId] }));
  }

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-[var(--dourado)]/40 bg-white/80 p-4">
        <h1 className="text-3xl font-black md:text-4xl">{title}</h1>
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
            </>
          ) : (
            <p className="text-sm text-[var(--carvao)]/75">Nenhuma aula cadastrada ainda.</p>
          )}
        </article>

        <aside className="rounded-2xl border border-white/60 bg-white/80 p-3">
          <h3 className="font-semibold">Módulos e aulas</h3>
          <div className="mt-3 space-y-3">
            {modules.length === 0 ? (
              <p className="text-sm text-[var(--carvao)]/70">Sem módulos por enquanto.</p>
            ) : (
              modules.map((module) => (
                <div key={module.id} className="rounded-lg border border-[var(--dourado)]/35 bg-[var(--creme)]/55 p-2">
                  <p className="text-sm font-semibold">{module.title}</p>
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
                        <span>{completed[lesson.id] ? "✓" : ""}</span>
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
