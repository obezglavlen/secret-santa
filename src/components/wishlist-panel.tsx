import { FormEvent } from "react";
import type { WishlistItem } from "@/types/secret-santa";

type Props = {
  textDraft: string;
  descriptionDraft: string;
  items: WishlistItem[];
  onTextChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddItem: (event: FormEvent<HTMLFormElement>) => void;
  onRemoveItem: (itemId: string) => void;
  saving: boolean;
};

export default function WishlistPanel({
  textDraft,
  descriptionDraft,
  items,
  onTextChange,
  onDescriptionChange,
  onAddItem,
  onRemoveItem,
  saving,
}: Props) {
  const label =
    items.length === 1 ? "подарок" : items.length >= 2 && items.length <= 4 ? "подарка" : "подарков";

  return (
    <div className="festive-card px-6 py-5 text-white">
      <h3 className="text-lg font-semibold">Вишлист</h3>
      <p className="mt-1 text-xs text-white/70">
        Добавляй отдельные карточки с названием и описанием — список сохранится автоматически.
      </p>

      <form onSubmit={onAddItem} className="mt-4 flex flex-col gap-3">
        <input
          className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-emerald-400"
          placeholder="Название подарка"
          value={textDraft}
          onChange={(event) => onTextChange(event.target.value)}
        />
        <textarea
          className="min-h-30 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400"
          placeholder="Описание: цвет, размер, ссылка, идея или любые детали"
          value={descriptionDraft}
          onChange={(event) => onDescriptionChange(event.target.value)}
        />

        <div className="flex items-center justify-between text-xs text-white/70">
          <span>
            В списке {items.length} {label}
          </span>
          <button
            type="submit"
            disabled={saving || !textDraft.trim()}
            className="rounded-2xl bg-linear-to-r from-amber-300 to-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-900 transition hover:brightness-110 disabled:opacity-60"
          >
            Добавить
          </button>
        </div>
      </form>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/60">
          <span>Добавленные пожелания</span>
          <span>{saving ? "Синхронизируем..." : "Синхронизировано"}</span>
        </div>

        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{item.text}</p>
                    {item.description ? (
                      <p className="mt-2 text-sm leading-6 text-white/70">
                        {item.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm text-white/45">Описание не указано</p>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => onRemoveItem(item.id)}
                    className="shrink-0 rounded-2xl border border-rose-300/30 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-100 transition hover:bg-rose-300/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-white/10 bg-black/20 px-4 py-5 text-sm text-white/55">
            Пока пусто — добавь первый подарок с названием и коротким описанием.
          </div>
        )}
      </div>
    </div>
  );
}