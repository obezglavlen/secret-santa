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
    <div className="festive-card px-6 py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Управляйте праздником</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-emerald-200">
          {participantsCount} участников
        </span>
      </div>
      <p className="mt-2 text-sm text-white/70">
        Когда все друзья подключены — нажмите старт для тайного обмена подарками.
      </p>
      <button
        type="button"
        onClick={onStart}
        disabled={!canStart || pending}
        className="mt-4 w-full rounded-2xl bg-gradient-to-r from-lime-400 via-emerald-500 to-cyan-500 px-4 py-3 text-sm font-semibold text-gray-900 transition hover:brightness-110 disabled:opacity-60"
      >
        {started ? "Жеребьевка активна" : "Запустить жеребьевку"}
      </button>
      {participantsCount < 2 && (
        <p className="mt-2 text-xs text-amber-200">
          Добавьте хотя бы ещё одного участника.
        </p>
      )}
    </div>
  );
}
