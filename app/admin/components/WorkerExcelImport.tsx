"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  Search,
  Users,
  CheckCircle2,
} from "lucide-react";

interface WorkerExcelImportProps {
  onWorkerSelect: (worker: any) => void;
}

export default function WorkerExcelImport({
  onWorkerSelect,
}: WorkerExcelImportProps) {
  const [workers, setWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [fileName, setFileName] = useState("");
  const [showWorkers, setShowWorkers] = useState(false);
  const [selectedWorker, setSelectedWorker] =
    useState<any>(null);

  const handleExcelUpload = (file: File) => {
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;

      const workbook = XLSX.read(data, {
        type: "binary",
      });

      const worksheet =
        workbook.Sheets[workbook.SheetNames[0]];

      const jsonData = XLSX.utils.sheet_to_json(
        worksheet,
      );

      setWorkers(jsonData as any[]);
      setShowWorkers(true);
    };

    reader.readAsBinaryString(file);
  };

  const filteredWorkers = workers.filter((worker) =>
    String(worker["Full Name"] || "")
      .toLowerCase()
      .includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* Upload Card */}

      <div className="rounded-3xl border-2 border-dashed border-orange-200 bg-orange-50/40 p-6">
        <label className="cursor-pointer flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-3">
            <UploadCloud className="w-7 h-7 text-[#FF5C39]" />
          </div>

          <h3 className="font-semibold text-[#0F172A]">
            Upload Worker Excel
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Import workers directly from onboarding form
          </p>

          {fileName && (
            <div className="mt-3 px-4 py-2 rounded-full bg-white border text-xs font-medium">
              {fileName}
            </div>
          )}

          <input
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (file) {
                handleExcelUpload(file);
              }
            }}
          />
        </label>
      </div>

      {/* Selected Worker */}

      {selectedWorker && (
        <div className="bg-green-50 border border-green-200 rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600" />

              <div>
                <h3 className="font-semibold text-green-800">
                  {selectedWorker["Full Name"]}
                </h3>

                <p className="text-sm text-green-600">
                  {selectedWorker["Mobile Number"]}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowWorkers(true)}
              className="px-4 py-2 rounded-xl bg-white border border-green-200 text-sm font-medium hover:bg-green-100"
            >
              Change Worker
            </button>
          </div>
        </div>
      )}

      {/* Worker List */}

      {workers.length > 0 && showWorkers && (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#0F172A]">
                Select Worker
              </h3>

              <p className="text-sm text-gray-500">
                {workers.length} Workers Available
              </p>
            </div>

            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#FF5C39]" />
            </div>
          </div>

          {/* Search */}

          <div className="relative mb-4">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-gray-400" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search worker by name..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl border border-gray-200 outline-none focus:border-[#FF5C39]"
            />
          </div>

          {/* Scroll List */}

          <div className="max-h-[420px] overflow-y-auto rounded-2xl border border-gray-100">
            {filteredWorkers.map((worker, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setSelectedWorker(worker);
                  onWorkerSelect(worker);
                  setShowWorkers(false);
                }}
                className="w-full text-left p-4 border-b border-gray-100 hover:bg-orange-50 transition-all"
              >
                <div className="font-semibold text-[#0F172A]">
                  {worker["Full Name"]}
                </div>

                <div className="text-xs text-gray-500 mt-1">
                  {worker["Mobile Number"]}
                </div>

                <div className="text-xs text-gray-400 mt-1">
                  {worker["Current City / Area"] ||
                    worker["Full Address (Optional)"] ||
                    "No Address"}
                </div>
              </button>
            ))}

            {filteredWorkers.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No workers found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}