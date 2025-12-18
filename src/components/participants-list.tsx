import { Participant } from "@/types/secret-santa";

type Props = {
  participants: Participant[];
  highlightId?: string | null;
};

export default function ParticipantsList({ participants, highlightId }: Props) {
  return (
    <div className="rounded-2xl border border-zinc-100 p-4 dark:border-zinc-700">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">
        Список участников
      </h3>
      <ul className="mt-3 flex flex-col gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className={`rounded-lg border border-transparent px-3 py-2 ${
              participant.id === highlightId
                ? "border-red-200 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200"
                : "bg-zinc-50 dark:bg-zinc-800"
            }`}
          >
            {participant.name}
            {participant.id === highlightId && (
              <span className="ml-2 text-xs uppercase tracking-wider text-red-500">
                это вы
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
