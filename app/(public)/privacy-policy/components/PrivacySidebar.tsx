import Link from "next/link";

interface Chapter {
  id: string;
  number: string;
  title: string;
}

interface Props {
  chapters: Chapter[];
}

export default function PrivacySidebar({ chapters }: Props) {
  return (
    <aside className="sticky top-6 hidden h-fit w-72 rounded-2xl border bg-white p-6 lg:block">
      <h2 className="mb-4 text-lg font-bold">Contents</h2>

      <nav className="space-y-2">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            href={`#${chapter.id}`}
            className="block rounded-lg px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            {chapter.number}. {chapter.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
