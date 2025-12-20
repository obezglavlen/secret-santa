import { FormEvent } from "react";

type Props = {
  draft: string;
  onDraftChange: (value: string) => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  saving: boolean;
  savedCount: number;
};

export default function WishlistPanel({
  draft,
  onDraftChange,
  onSave,
  saving,
  savedCount,
}: Props) {
  const label = savedCount === 1 ? "желание" : "пожеланий";

  return (
    <div className="festive-card px-6 py-5 text-white">
      <h3 className="text-lg font-semibold">Вишлист</h3>
      <p className="mt-1 text-xs text-white/70">
        Пиши желания по одной строке — их можно редактировать до и после жеребьевки.
      </p>

      <form onSubmit={onSave} className="mt-4 flex flex-col gap-3">
        <textarea
          className="min-h-[120px] rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
          placeholder="Например: новая книга, тёплый плед или вечер вместе"
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
        />

        <div className="flex items-center justify-between text-xs text-white/70">
          <span>
            Сохранено {savedCount} {label}
          </span>
          <button
            type="submit"
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-amber-300 to-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:brightness-110 disabled:opacity-60"
          >
            {saving ? "Сохраняем..." : "Сохранить"}
          </button>
        </div>
      </form>
    </div>
  );
}