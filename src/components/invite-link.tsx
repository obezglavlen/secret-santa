type Props = {
  shareLink: string;
  onCopy: () => void;
};

export default function InviteLink({ shareLink, onCopy }: Props) {
  return (
    <div className="festive-card snow-fade border-0 px-6 py-4">
      <p className="text-xs uppercase tracking-[0.4em] text-amber-200">Приглашение</p>
      <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white shadow-lg sm:flex-row">
        <input
          className="flex-1 bg-transparent text-white outline-none"
          value={shareLink}
          readOnly
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded-2xl bg-gradient-to-r from-emerald-400 to-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:brightness-110"
        >
          Скопировать
        </button>
      </div>
    </div>
  );
}
