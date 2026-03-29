import type { WishlistItem } from "@/types/secret-santa";

type Props = {
  youAreInRoom: boolean;
  alreadyStarted: boolean;
  assignmentName?: string;
  assignedWishlist?: WishlistItem[];
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
              <div className="mt-3 space-y-3 text-sm text-white/80">
                {assignedWishlist.map((wish) => (
                  <div
                    key={wish.id}
                    className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4"
                  >
                    <p className="font-semibold text-white">{wish.text}</p>
                    {wish.description ? (
                      <p className="mt-2 leading-6 text-white/70">{wish.description}</p>
                    ) : (
                      <p className="mt-2 text-white/45">Описание не указано</p>
                    )}
                  </div>
                ))}
              </div>
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
