type Props = {
  youAreInRoom: boolean;
  alreadyStarted: boolean;
  assignmentName?: string;
  assignedWishlist?: string[];
};

export default function AssignmentPanel({
  youAreInRoom,
  alreadyStarted,
  assignmentName,
  assignedWishlist,
}: Props) {
  if (!youAreInRoom) {
    return null;
  }

  return (
    <div className="festive-card snow-fade px-6 py-6 text-center">
      <p className="text-xs uppercase text-amber-200">Ваш получатель</p>
      {!alreadyStarted && (
        <p className="mt-3 text-lg font-semibold text-white">
          Ждём волшебного старта 🎁
        </p>
      )}
      {alreadyStarted && assignmentName && (
        <>
          <p className="mt-4 text-sm text-white/70">Дарите подарок</p>
          <p className="text-4xl font-black text-emerald-300">{assignmentName}</p>
          <p className="mt-2 text-sm text-white/70">
            Это секрет — только вы видите имя.
          </p>
          <div className="mt-6 text-left">
            <p className="text-xs uppercase tracking-[0.3em] text-amber-200">
              Пожелания получателя
            </p>
            {assignedWishlist && assignedWishlist.length > 0 ? (
              <ul className="mt-2 space-y-2 text-sm text-white/80">
                {assignedWishlist.map((wish, index) => (
                  <li
                    key={`${wish}-${index}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2"
                  >
                    {wish}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-white/60">
                Получатель ещё не записал пожеланий.
              </p>
            )}
          </div>
        </>
      )}
      {alreadyStarted && !assignmentName && (
        <p className="mt-4 text-lg font-semibold text-white/80">
          Мы обновляем данные, подождите секунду...
        </p>
      )}
    </div>
  );
}
