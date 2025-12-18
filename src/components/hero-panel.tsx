export default function HeroPanel() {
  return (
    <div className="festive-card relative overflow-hidden bg-gradient-to-br from-red-600/90 via-rose-500/80 to-indigo-700/80 p-10 text-white">
      <div className="absolute inset-0 opacity-60 blur-3xl" />
      <p className="text-xs uppercase tracking-[0.4em] text-amber-100">
        Тайный Санта
      </p>
      <h1 className="mt-4 text-4xl font-black leading-tight">
        Новый год начинается с добрых подарков
      </h1>
      <p className="mt-4 text-lg text-white/80">
        Создавайте комнаты, делитесь ссылками и запускайте жеребьевку — каждый увидит лишь своего получателя.
      </p>
      <div className="mt-6 flex flex-wrap gap-3 text-sm text-amber-100">
        <span className="rounded-full bg-white/20 px-4 py-1">Без повторов</span>
        <span className="rounded-full bg-white/20 px-4 py-1">Никто не дарит себе</span>
        <span className="rounded-full bg-white/20 px-4 py-1">Сейчас или позже</span>
      </div>
    </div>
  );
}
