interface Section {
  title: string;
  content: string[];
}

interface Chapter {
  id: string;
  number: string;
  title: string;
  sections: Section[];
}

interface Props {
  chapter: Chapter;
}

export default function PrivacySection({ chapter }: Props) {
  return (
    <section id={chapter.id} className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl border border-emerald-100 bg-linear-to-r from-emerald-50 to-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="shrink-0 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            Chapter {chapter.number}
          </span>

          <h2 className="min-w-0 flex-1 text-sm font-semibold leading-5 text-slate-900">
            {chapter.title}
          </h2>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        {chapter.sections.map((section) => (
          <div key={section.title} className="">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              {section.title}
            </h3>

            <div className="space-y-3">
              {section.content.map((paragraph, index) => (
                <p key={index} className="text-[14px] leading-7 text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
