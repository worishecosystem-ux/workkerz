import { Worker, serviceCategories } from "@/app/data/workers";
import ServiceSection from "./ServiceSection";

interface Props {
  workers: Worker[];
}

export default function HomeServices({ workers }: Props) {
  return (
    <div className="space-y-10">
      {serviceCategories
        .filter((c) => c.id !== "all")
        .map((category) => {
          const list = workers.filter(
            (worker) => worker.category === category.id
          );

          if (list.length === 0) return null;

          return (
            <ServiceSection
              key={category.id}
              title={category.label}
              category={category.id}
              workers={list}
            />
          );
        })}
    </div>
  );
}