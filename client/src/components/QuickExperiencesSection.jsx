import useTranslation from '../hooks/useTranslation.js';
import { useQuery } from "@tanstack/react-query";
import ExperienceCard from "./experience/ExperienceCard.jsx";
import { getExperiences } from "../services/experienceService.js";

export default function QuickExperiencesSection() {
  const { t } = useTranslation();

  const { data: experiences = [] } = useQuery({
    queryKey: ["quickExperiences"],
    queryFn: () => getExperiences({ limit: 12 }).then((res) => {
      const items = res.data.data || [];
      return items.filter((item) => Number(item?.duration || 0) <= 60);
    }),
  });

  if (!experiences.length) return null;

  return (
    <section className="px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-amber-700">{t("quick_experiences")}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">{t("search_under_1h")}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {experiences.slice(0, 4).map((experience) => (
            <ExperienceCard key={experience._id} experience={experience} />
          ))}
        </div>
      </div>
    </section>
  );
}
