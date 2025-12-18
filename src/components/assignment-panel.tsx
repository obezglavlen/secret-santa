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
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 text-center dark:border-red-500/40 dark:bg-red-500/10">
      <p className="text-sm uppercase tracking-[0.4em] text-red-500">Ваш получатель</p>
      {!alreadyStarted && (
        <p className="mt-3 text-lg text-red-700 dark:text-red-200">
          Ждем, когда организатор нажмет «Старт».
        </p>
      )}
      {alreadyStarted && assignmentName && (
        <>
          <p className="mt-4 text-sm text-red-400">Дарите подарок</p>
          <p className="text-3xl font-semibold text-red-600 dark:text-red-200">
            {assignmentName}
          </p>
          <p className="mt-2 text-sm text-red-500 dark:text-red-200/90">
            Никто больше не увидит этого имени, кроме вас.
          </p>
        </>
      )}
      {alreadyStarted && !assignmentName && (
        <p className="mt-4 text-lg text-red-700 dark:text-red-200">
          Мы не нашли вашу запись. Попробуйте перезагрузить страницу.
        </p>
      )}
    </div>
  );
}
