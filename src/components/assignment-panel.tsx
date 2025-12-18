type Props = {
  youAreInRoom: boolean;
  alreadyStarted: boolean;
  assignmentName?: string;
};

export default function AssignmentPanel({
  youAreInRoom,
  alreadyStarted,
  assignmentName,
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
