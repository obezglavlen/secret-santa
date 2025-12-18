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
    <section className="rounded-2xl border border-red-100 bg-white/90 p-8 shadow-lg shadow-red-100 dark:border-white/10 dark:bg-zinc-900/90 dark:shadow-black/40">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">
        Создать новую комнату
      </h2>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        После создания вы получите ссылку и сможете поделиться ей с друзьями.
      </p>
      <form className="mt-6 flex flex-col gap-4" onSubmit={onSubmit}>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Ваше имя
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
            placeholder="Например, Катя"
            value={hostName}
            onChange={(event) => onHostChange(event.target.value)}
            required
          />
        </label>
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
          Название комнаты (необязательно)
          <input
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-900 outline-none transition focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
            placeholder="Семейный круг 2024"
            value={roomName}
            onChange={(event) => onRoomChange(event.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={creating}
          className="mt-2 rounded-xl bg-red-500 px-6 py-3 text-lg font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
        >
          {creating ? "Создание..." : "Создать комнату"}
        </button>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </section>
  );
}
