export default function HeroPanel() {
  return (
    <div className="rounded-2xl border border-black/5 bg-white/80 p-8 shadow-lg shadow-zinc-200 backdrop-blur dark:border-white/10 dark:bg-zinc-900/80 dark:shadow-black/30">
      <p className="text-sm uppercase tracking-[0.2em] text-red-500">Тайный Санта</p>
      <h1 className="mt-4 text-4xl font-semibold text-zinc-900 dark:text-white">
        Создайте комнату, позовите друзей и проведите жеребьевку в один клик
      </h1>
      <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-300">
        Участники заходят по ссылке, вводят имя, а вы запускаете старт. Каждый увидит только своего получателя подарка.
      </p>
    </div>
  );
}
