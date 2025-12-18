import { Participant } from "@/types/secret-santa";

type Props = {
  participants: Participant[];
  highlightId?: string | null;
};

export default function ParticipantsList({ participants, highlightId }: Props) {
  return (
    <div className="festive-card px-6 py-5 text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Участники</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-amber-200">
          {participants.length}
        </span>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-white/80">
        {participants.map((participant) => (
          <li
            key={participant.id}
            className={`flex items-center justify-between rounded-2xl border border-white/5 px-4 py-2 transition hover:border-amber-300 ${
              participant.id === highlightId
                ? "bg-white/15 text-emerald-200"
                : "bg-black/20"
            }`}
          >
            <span>{participant.name}</span>
            {participant.id === highlightId && (
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs uppercase text-emerald-200">
                это вы
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
