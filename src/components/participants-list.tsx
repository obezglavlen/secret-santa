import { Participant } from "@/types/secret-santa";

type Props = {
  participants: Participant[];
  highlightId?: string | null;
  showKickButton?: boolean;
  onKick?: (participantId: string) => void;
  busyId?: string | null;
};

export default function ParticipantsList({
  participants,
  highlightId,
  showKickButton,
  onKick,
  busyId,
}: Props) {
  return (
    <div className="festive-card px-6 py-5 text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Участники</h3>
        <span className="text-xs uppercase tracking-[0.3em] text-amber-200">
          {participants.length}
        </span>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-white/80">
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
            <div className="flex items-center gap-2">
              {participant.id === highlightId && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs uppercase text-emerald-200">
                  вы
                </span>
              )}
              {showKickButton &&
                onKick &&
                participant.id !== highlightId &&
                !busyId && (
                  <button
                    type="button"
                    onClick={() => onKick(participant.id)}
                    className="rounded-full border border-white/30 px-3 py-1 text-xs uppercase text-rose-200 transition hover:border-rose-400"
                  >
                    Кик
                  </button>
                )}
              {showKickButton &&
                onKick &&
                participant.id !== highlightId &&
                busyId === participant.id && (
                  <span className="text-xs uppercase tracking-[0.3em] text-amber-200">
                    удаляем...
                  </span>
                )}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-white/60">
        Удалить участника может только организатор.
      </p>
    </div>
  );
}
