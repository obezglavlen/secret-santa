import { FormEvent } from "react";

type Props = {
  youAreInRoom: boolean;
  participantName?: string;
  pending: boolean;
  onJoin: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  joinName: string;
  isOwner?: boolean;
  roomStarted?: boolean;
};

export default function JoinPanel({
  youAreInRoom,
  participantName,
  pending,
  onJoin,
  onNameChange,
  joinName,
  isOwner,
  roomStarted,
}: Props) {
  return (
    <div className="festive-card px-6 py-5">
      <h3 className="text-lg font-semibold text-white">
        {youAreInRoom ? "Вы в круге" : "Присоединиться"}
      </h3>

      {!youAreInRoom && !roomStarted && (
        <form className="mt-4 flex flex-col gap-3" onSubmit={onJoin}>
          <input
            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300"
            placeholder="Ваше имя"
            value={joinName}
            onChange={(event) => onNameChange(event.target.value)}
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:opacity-60"
          >
            {pending ? "Готовим волшебство..." : "Войти в комнату"}
          </button>
        </form>
      )}

      {!youAreInRoom && roomStarted && (
        <p className="mt-4 text-sm text-amber-200">
          Жеребьевка уже началась — вход закрыт.
        </p>
      )}

      {youAreInRoom && (
        <div className="mt-4 space-y-2 text-sm text-white/80">
          <p>Вы в игре как {participantName}.</p>
          {isOwner && (
            <p className="text-amber-200">
              Вы организатор, можете нажать «Старт» когда всё готово.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
