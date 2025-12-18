import { FormEvent } from "react";

type Props = {
  hostName: string;
  roomName: string;
  creating: boolean;
  error?: string | null;
  onHostChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function CreateRoomForm({
  hostName,
  roomName,
  creating,
  error,
  onHostChange,
  onRoomChange,
  onSubmit,
}: Props) {
  return (
    <section className="festive-card snow-fade px-8 py-10">
      <div className="flex flex-col gap-2">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-200">Новая комната</p>
        <h2 className="text-3xl font-semibold text-white">Запустите праздник</h2>
        <p className="text-sm text-white/70">
          Введите имя организатора и название комнаты, чтобы получить ссылку.
        </p>
      </div>
      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="text-sm text-white/70">
          Ваше имя
          <input
            className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400"
            value={hostName}
            onChange={(event) => onHostChange(event.target.value)}
            required
          />
        </label>
        <label className="text-sm text-white/70">
          Название комнаты (необязательно)
          <input
            className="mt-1 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white outline-none transition focus:border-emerald-400"
            value={roomName}
            onChange={(event) => onRoomChange(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="mt-4 rounded-2xl bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-3 text-lg font-semibold text-zinc-900 transition hover:brightness-110 disabled:opacity-60"
        >
          {creating ? "Создание..." : "Создать комнату"}
        </button>
        {error && <p className="text-sm text-rose-200">{error}</p>}
      </form>
    </section>
  );
}
