import type { WorkerGroup } from "@/app/components/ProjectWorkerGroups";

export type RequesterType =
  | "individual"
  | "contractor"
  | "company";

export interface RequestStepProps {
  onNext: () => void;
  onBack?: () => void;
}

export interface WorkerStepProps extends RequestStepProps {
  projectName: string;
  setProjectName: (value: string) => void;

  projectType: string;
  setProjectType: (value: string) => void;

  workerGroups: WorkerGroup[];
  setWorkerGroups: (
    value: WorkerGroup[]
  ) => void;
}