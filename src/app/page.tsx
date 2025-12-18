import { Suspense } from "react";
import SecretSantaClient from "./secret-santa-client";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-10 text-white">
          <div className="mx-auto flex max-w-4xl flex-col gap-8">
            <div className="festive-card px-8 py-10 text-center text-white/80">
              Загрузка волшебства...
            </div>
          </div>
        </div>
      }
    >
      <SecretSantaClient />
    </Suspense>
  );
}
