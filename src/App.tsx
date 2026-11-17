import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  Clock,
  FlaskConical,
  MapPin,
  Printer,
  Search,
  X,
} from "lucide-react";
import { KemuLogo } from "./components/KemuLogo";
import {
  CAMPUS_NAMES,
  EXAMS,
  parseStartMinutes,
  type CampusCode,
  type ExamUnit,
} from "./data/exams";

type PageView = "home" | "results";
type CampusFilter = "ALL" | CampusCode;
type TypeFilter = "ALL" | "THEORY" | "PRACTICAL";

const STORAGE_KEY = "kemu_tvet_selected_units_v1";

export default function App() {
  const [page, setPage] = useState<PageView>("home");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCodes, setSelectedCodes] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((c) => typeof c === "string");
        }
      }
    } catch {
      // Ignore storage access failures
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCodes));
    } catch {
      // Ignore storage write failures
    }
  }, [selectedCodes]);

  const selectedSet = useMemo(() => new Set(selectedCodes), [selectedCodes]);

  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return EXAMS.filter((exam) => {
      const matchesSearch =
        !q ||
        exam.code.toLowerCase().includes(q) ||
        exam.title.toLowerCase().includes(q) ||
        exam.venue.toLowerCase().includes(q);
      const matchesCampus =
        campusFilter === "ALL" || exam.campus === campusFilter;
      const matchesType =
        typeFilter === "ALL" ||
        (typeFilter === "PRACTICAL" && exam.practical) ||
        (typeFilter === "THEORY" && !exam.practical);
      return matchesSearch && matchesCampus && matchesType;
    });
  }, [searchQuery, campusFilter, typeFilter]);

  const selectedExams = useMemo(() => {
    return EXAMS.filter((exam) => selectedSet.has(exam.code)).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      if (a.day !== b.day) {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const dayA = dayOrder.findIndex((d) => a.day.startsWith(d));
        const dayB = dayOrder.findIndex((d) => b.day.startsWith(d));
        if (dayA !== dayB) return dayA - dayB;
      }
      return parseStartMinutes(a.time) - parseStartMinutes(b.time);
    });
  }, [selectedSet]);

  const selectedPracticals = useMemo(
    () => selectedExams.filter((exam) => exam.practical),
    [selectedExams]
  );

  const { clashGroups, clashCodes } = useMemo(() => {
    const map = new Map<string, ExamUnit[]>();
    selectedExams.forEach((exam) => {
      const key = `${exam.day}|${exam.time}`;
      const list = map.get(key) || [];
      list.push(exam);
      map.set(key, list);
    });
    const groups = Array.from(map.values()).filter((group) => group.length > 1);
    const codes = new Set<string>();
    groups.forEach((group) => group.forEach((exam) => codes.add(exam.code)));
    return { clashGroups: groups, clashCodes: codes };
  }, [selectedExams]);

  const examsByDay = useMemo(() => {
    const groups: { day: string; items: ExamUnit[] }[] = [];
    const indexByDay = new Map<string, number>();
    selectedExams.forEach((exam) => {
      const existingIdx = indexByDay.get(exam.day);
      if (existingIdx === undefined) {
        indexByDay.set(exam.day, groups.length);
        groups.push({ day: exam.day, items: [exam] });
      } else {
        groups[existingIdx].items.push(exam);
      }
    });
    return groups;
  }, [selectedExams]);

  function toggleUnit(code: string) {
    setSelectedCodes((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  function clearSelection() {
    setSelectedCodes([]);
  }

  function navigateTo(target: PageView) {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7f5fa] text-[#1a202c]">
      <header className="no-print sticky top-0 z-50 bg-gradient-to-br from-[#4A1C6B] to-[#1E3A5F] text-white border-b-[3px] border-[#C9A227] shadow-[0_2px_12px_rgba(74,28,107,0.28)]">
        <div className="max-w-[1000px] mx-auto px-4 sm:px-5 py-3 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C547] rounded-lg"
          >
            <KemuLogo />
            <div>
              <span className="block text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
                Kenya Methodist University
              </span>
              <span className="block text-xs text-[#E8C547] font-medium whitespace-nowrap">
                TVET · The Future is Here
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-2 shrink-0" aria-label="Primary">
            <button
              type="button"
              onClick={() => navigateTo("home")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 border ${
                page === "home"
                  ? "bg-[#C9A227] text-[#4A1C6B] border-[#C9A227]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              Select Units
            </button>
            <button
              type="button"
              onClick={() => navigateTo("results")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 border ${
                page === "results"
                  ? "bg-[#C9A227] text-[#4A1C6B] border-[#C9A227]"
                  : "bg-white/10 text-white border-white/20 hover:bg-white/20"
              }`}
            >
              My Timetable
              {selectedCodes.length > 0 && (
                <span className="ml-1.5 font-mono tabular-nums opacity-90">
                  ({selectedCodes.length})
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="print-container flex-1 w-full max-w-[1000px] mx-auto px-4 pt-6 pb-14">
        {page === "home" ? (
          <section aria-labelledby="select-units-heading">
            <div className="text-center mb-6">
              <h1
                id="select-units-heading"
                className="text-2xl sm:text-[1.65rem] font-bold text-[#4A1C6B] tracking-tight text-balance mb-1.5"
              >
                Build Your Personal Exam Timetable
              </h1>
              <p className="text-sm sm:text-[0.95rem] text-[#64748b] max-w-[560px] mx-auto">
                Filter by campus or paper type and select your units. The generator
                detects time collisions and highlights practical sessions.
              </p>
            </div>

            {/* Campus Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-3">
              {(
                [
                  { id: "ALL", label: "All Campuses" },
                  { id: "NRB", label: "Nairobi (NRB)" },
                  { id: "MSA", label: "Mombasa (MSA)" },
                  { id: "MTC", label: "Meru (MTC)" },
                ] as { id: CampusFilter; label: string }[]
              ).map((item) => {
                const active = campusFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCampusFilter(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors duration-150 ${
                      active
                        ? "bg-[#4A1C6B] border-[#4A1C6B] text-white"
                        : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#4A1C6B] hover:text-[#4A1C6B]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Paper Type Filters */}
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              {(
                [
                  { id: "ALL", label: "All Papers", activeClass: "bg-[#4A1C6B] border-[#4A1C6B] text-white" },
                  { id: "THEORY", label: "Theory Only", activeClass: "bg-[#1E3A5F] border-[#1E3A5F] text-white" },
                  { id: "PRACTICAL", label: "Practical Only", activeClass: "bg-[#6B3A8C] border-[#6B3A8C] text-white" },
                ] as { id: TypeFilter; label: string; activeClass: string }[]
              ).map((item) => {
                const active = typeFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTypeFilter(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors duration-150 ${
                      active
                        ? item.activeClass
                        : "bg-white border-[#e2e8f0] text-[#64748b] hover:border-[#4A1C6B] hover:text-[#4A1C6B]"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative mb-4">
              <Search
                className="w-4 h-4 text-[#64748b] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by unit code, title, or venue..."
                aria-label="Search units"
                className="w-full pl-11 pr-10 py-3 bg-white border border-[#e2e8f0] rounded-xl text-sm sm:text-base text-[#1a202c] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#4A1C6B] focus:ring-3 focus:ring-[#4A1C6B]/15 transition-shadow"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#64748b] hover:text-[#1a202c] rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Practical Notice */}
            {selectedPracticals.length > 0 && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-[#c4b5fd] bg-[#f3e8ff] px-4 py-3 text-sm text-[#5b21b6]"
              >
                <div className="flex items-center gap-2 font-semibold mb-1.5">
                  <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>Practical exams in your selection</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPracticals.map((exam) => (
                    <li key={exam.code}>
                      <span className="font-mono font-bold">{exam.code}</span>{" "}
                      — {exam.day.split(",")[0]} at {exam.time} (
                      {CAMPUS_NAMES[exam.campus]})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="bg-[#4A1C6B] text-white px-4 py-2.5 rounded-lg text-sm font-semibold tabular-nums">
                {selectedCodes.length}{" "}
                {selectedCodes.length === 1 ? "unit" : "units"} selected
              </div>
              <button
                type="button"
                disabled={selectedCodes.length === 0}
                onClick={() => navigateTo("results")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#4A1C6B] text-white hover:bg-[#6B3A8C] disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                <span>Generate My Timetable</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCodes.length === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#4A1C6B] border border-[#4A1C6B] hover:bg-[#faf8fc] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0"
              >
                Clear All
              </button>
              <span className="ml-auto text-xs text-[#64748b] tabular-nums">
                Showing {filteredExams.length} of {EXAMS.length} papers
              </span>
            </div>

            {/* Unit List */}
            {filteredExams.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-xl text-center py-12 px-5 text-[#64748b]">
                <h2 className="text-base font-semibold text-[#1a202c] mb-1">
                  No units found
                </h2>
                <p className="text-sm mb-4">
                  Try clearing your search or switching campus and paper filters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setCampusFilter("ALL");
                    setTypeFilter("ALL");
                    setSearchQuery("");
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#4A1C6B] text-white hover:bg-[#6B3A8C] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-2.5">
                {filteredExams.map((exam) => {
                  const isSelected = selectedSet.has(exam.code);
                  return (
                    <label
                      key={exam.code}
                      className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#fef9e7] border-[#C9A227]"
                          : "bg-white border-[#e2e8f0] hover:border-[#6B3A8C]/60 hover:bg-[#faf8fc]"
                      }`}
                    >
                      <span className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleUnit(exam.code)}
                          className="peer sr-only"
                        />
                        <span
                          className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-[#4A1C6B] border-[#4A1C6B] text-white"
                              : "bg-white border-slate-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </span>
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-mono font-bold text-sm sm:text-[0.95rem] text-[#4A1C6B]">
                            {exam.code}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span
                            className={`text-xs font-semibold ${
                              exam.practical
                                ? "text-[#6B3A8C]"
                                : "text-[#0369a1]"
                            }`}
                          >
                            {exam.practical ? "Practical" : "Theory"}
                          </span>
                          <span className="text-slate-300" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-xs font-medium text-[#92400e]">
                            {CAMPUS_NAMES[exam.campus]} ({exam.campus})
                          </span>
                        </div>

                        <div className="text-sm sm:text-[0.95rem] font-medium text-[#1a202c] mt-0.5">
                          {exam.title}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#64748b]">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{exam.day.split(",")[0]}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>{exam.time}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>
                              {exam.campus} – {exam.venue}
                            </span>
                          </span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </section>
        ) : (
          <section aria-labelledby="timetable-heading">
            <div className="mb-5">
              <h1
                id="timetable-heading"
                className="text-xl sm:text-2xl font-bold text-[#4A1C6B] tracking-tight"
              >
                Your Personal Exam Timetable
              </h1>
              <p className="text-sm text-[#64748b] mt-0.5">
                End of Trimester 3, 2026 · Draft 2
              </p>
            </div>

            {selectedExams.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-xl text-center py-14 px-6">
                <h2 className="text-lg font-semibold text-[#1a202c] mb-1.5">
                  No units selected yet
                </h2>
                <p className="text-sm text-[#64748b] max-w-md mx-auto mb-5">
                  Select your registered units from the exam schedule to generate
                  your personal timetable and check for any time collisions.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo("home")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#4A1C6B] text-white hover:bg-[#6B3A8C] transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Select Units</span>
                </button>
              </div>
            ) : (
              <>
                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#e2e8f0] text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#4A1C6B] tabular-nums">
                      {selectedExams.length}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      Total Exams
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#e2e8f0] text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#6B3A8C] tabular-nums">
                      {selectedPracticals.length}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      Practical Papers
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#e2e8f0] text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#c05621] tabular-nums">
                      {clashGroups.length}
                    </div>
                    <div className="text-xs text-[#64748b] mt-0.5">
                      Time Collisions
                    </div>
                  </div>
                </div>

                {/* Practical Exam Alert */}
                {selectedPracticals.length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#c4b5fd] bg-[#f3e8ff] p-4 text-sm text-[#5b21b6]">
                    <div className="flex items-center gap-2 font-bold mb-1.5">
                      <FlaskConical className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>You have Practical Exam(s)</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPracticals.map((exam) => (
                        <li key={exam.code}>
                          <span className="font-mono font-bold">
                            {exam.code}
                          </span>{" "}
                          – {exam.day.split(",")[0]} at{" "}
                          <strong className="tabular-nums">{exam.time}</strong> (
                          {CAMPUS_NAMES[exam.campus]}, {exam.venue})
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-[#5b21b6]/90">
                      Make sure you are prepared and seated early for these
                      practical lab sessions.
                    </p>
                  </div>
                )}

                {/* Colliding Units Alert */}
                {clashGroups.length > 0 && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border border-amber-500 bg-amber-50 p-4 text-sm text-[#92400e]"
                  >
                    <div className="flex items-center gap-2 font-bold mb-1.5">
                      <AlertTriangle
                        className="w-4 h-4 shrink-0"
                        aria-hidden="true"
                      />
                      <span>Colliding Units Detected</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {clashGroups.map((group) => (
                        <li key={`${group[0].day}-${group[0].time}`}>
                          <strong>{group[0].day.split(",")[0]}</strong> at{" "}
                          <span className="tabular-nums">{group[0].time}</span>:{" "}
                          {group.map((exam, idx) => (
                            <span key={exam.code}>
                              {idx > 0 && " & "}
                              <strong className="font-mono">{exam.code}</strong>{" "}
                              ({CAMPUS_NAMES[exam.campus]})
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-[#92400e]/90">
                      These exams are scheduled at the same time. If they are on
                      different campuses, confirm which campus you belong to.
                    </p>
                  </div>
                )}

                {/* Day-by-Day Timetable */}
                <div className="space-y-7">
                  {examsByDay.map(({ day, items }) => {
                    const [dayName, datePart] = day.split(",");
                    return (
                      <div key={day}>
                        <div className="flex flex-wrap items-center gap-2.5 pb-2 mb-3 border-b-2 border-[#C9A227]">
                          <h2 className="text-lg font-bold text-[#4A1C6B]">
                            {dayName}
                          </h2>
                          {datePart && (
                            <span className="bg-[#4A1C6B] text-white text-xs font-semibold px-2.5 py-1 rounded-md">
                              {datePart.trim()}
                            </span>
                          )}
                        </div>

                        <div className="space-y-3">
                          {items.map((exam) => {
                            const isClash = clashCodes.has(exam.code);
                            return (
                              <article
                                key={exam.code}
                                className={`print-card rounded-xl p-4 border transition-colors ${
                                  isClash
                                    ? "bg-amber-50/75 border-amber-500"
                                    : exam.practical
                                      ? "bg-[#faf6ff] border-[#6B3A8C]/35"
                                      : "bg-white border-[#e2e8f0]"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="font-mono text-xs sm:text-sm font-semibold text-[#4A1C6B] bg-[#f3e8ff] px-2.5 py-1 rounded-md tabular-nums">
                                    {exam.time}
                                  </span>

                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {isClash && (
                                      <>
                                        <span className="inline-flex items-center gap-1 font-semibold text-amber-800">
                                          <AlertTriangle
                                            className="w-3.5 h-3.5"
                                            aria-hidden="true"
                                          />
                                          Time Collision
                                        </span>
                                        <span
                                          className="text-slate-300"
                                          aria-hidden="true"
                                        >
                                          ·
                                        </span>
                                      </>
                                    )}
                                    <span
                                      className={`font-semibold ${
                                        exam.practical
                                          ? "text-[#6B3A8C]"
                                          : "text-[#0369a1]"
                                      }`}
                                    >
                                      {exam.practical ? "Practical" : "Theory"}
                                    </span>
                                    <span
                                      className="text-slate-300"
                                      aria-hidden="true"
                                    >
                                      ·
                                    </span>
                                    <span className="font-medium text-[#92400e]">
                                      {CAMPUS_NAMES[exam.campus]}
                                    </span>
                                  </div>
                                </div>

                                <div className="font-mono font-bold text-sm sm:text-base text-[#4A1C6B]">
                                  {exam.code}
                                </div>
                                <h3 className="text-sm sm:text-[0.95rem] font-semibold text-[#1a202c] mt-0.5">
                                  {exam.title}
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#e2e8f0] pt-3 mt-3 text-sm">
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#64748b] tracking-wide mb-0.5">
                                      Campus
                                    </span>
                                    <span className="text-[#1a202c]">
                                      {CAMPUS_NAMES[exam.campus]} ({exam.campus})
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#64748b] tracking-wide mb-0.5">
                                      Venue
                                    </span>
                                    <span className="text-[#1a202c]">
                                      {exam.venue}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#64748b] tracking-wide mb-0.5">
                                      Invigilator
                                    </span>
                                    <span className="text-[#1a202c]">
                                      {exam.invigilator}
                                    </span>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action Controls */}
                <div className="no-print mt-7 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => navigateTo("home")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#4A1C6B] border border-[#4A1C6B] hover:bg-[#faf8fc] transition-colors whitespace-nowrap shrink-0"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Edit Units</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#C9A227] text-[#4A1C6B] hover:bg-[#E8C547] transition-colors whitespace-nowrap shrink-0"
                  >
                    <Printer className="w-4 h-4" aria-hidden="true" />
                    <span>Print Timetable</span>
                  </button>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      <footer className="no-print text-center py-6 px-5 text-xs border-t-[3px] border-[#C9A227] bg-gradient-to-br from-[#4A1C6B] to-[#1E3A5F] text-white/85">
        <strong className="text-[#E8C547] font-semibold">
          Kenya Methodist University
        </strong>{" "}
        – TVET Institute
        <br />
        End of Trimester 3, 2026 Exam Timetable (Draft 2) · The Future is Here
      </footer>
    </div>
  );
}
