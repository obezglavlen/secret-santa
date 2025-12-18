type Props = {
  shareLink: string;
  onCopy: () => void;
};

export default function InviteLink({ shareLink, onCopy }: Props) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-200 p-4 dark:border-zinc-700">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">Ссылка для приглашения</p>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <input
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
          value={shareLink}
          readOnly
        />
        <button
          type="button"
          onClick={onCopy}
          className="rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900"
        >
          Скопировать
        </button>
      </div>
    </div>
  );
}
