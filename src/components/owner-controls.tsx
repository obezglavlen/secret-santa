type Props = {
  canStart: boolean;
  pending: boolean;
  participantsCount: number;
  started: boolean;
  onStart: () => void;
};

export default function OwnerControls({
  canStart,
  pending,
  participantsCount,
  started,
  onStart,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Управление</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Когда все участники добавлены, запустите жеребьевку.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={!canStart || pending}
        className="mt-4 w-full rounded-xl bg-green-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-green-300"
      >
        {started ? "Жеребьевка завершена" : "Запустить старт"}
      </button>
      {participantsCount < 2 && (
        <p className="mt-2 text-xs text-zinc-500">Нужно минимум два участника.</p>
      )}
    </div>
  );
}
