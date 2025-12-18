import { FormEvent } from "react";

type Props = {
  youAreInRoom: boolean;
  participantName?: string;
  pending: boolean;
  onJoin: (event: FormEvent<HTMLFormElement>) => void;
  onNameChange: (value: string) => void;
  joinName: string;
  isOwner?: boolean;
};

export default function JoinPanel({
  youAreInRoom,
  participantName,
  pending,
  onJoin,
  onNameChange,
  joinName,
  isOwner,
}: Props) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        {youAreInRoom ? "Вы в игре" : "Войдите чтобы участвовать"}
      </h3>

      {!youAreInRoom && (
        <form className="mt-4 flex flex-col gap-3" onSubmit={onJoin}>
          <input
            className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-red-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-400"
            placeholder="Ваше имя"
            value={joinName}
            onChange={(event) => onNameChange(event.target.value)}
            required
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-300"
          >
            {pending ? "Входим..." : "Присоединиться"}
          </button>
        </form>
      )}

      {youAreInRoom && (
        <div className="mt-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
          <p>Вы участвуете под именем {participantName}.</p>
          {isOwner && (
            <p className="text-red-500">
              Вы создатель комнаты и можете начинать жеребьевку.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
