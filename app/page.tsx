import Link from "next/link";

import { Converter } from "./_components/converter";
import { ThemeToggle } from "./_components/theme-toggle";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 py-8 sm:px-6">
      <div className="flex w-full max-w-3xl flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-lg font-bold tracking-tight">Feedme</span>
          <div className="flex items-center gap-3">
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-foreground">
              설정
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-balance">
            웹페이지를 Markdown으로
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            URL을 붙여넣으면 본문만 깔끔하게 추출합니다.
          </p>
        </div>
        <Converter />
      </div>
    </main>
  );
}
