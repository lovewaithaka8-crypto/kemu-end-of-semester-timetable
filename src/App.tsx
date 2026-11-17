import { type ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
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
  RotateCcw,
  Search,
  Upload,
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
const LOGO_STORAGE_KEY = "kemu_official_logo_data_v1";

export default function App() {
  const [page, setPage] = useState<PageView>("home");
  const [campusFilter, setCampusFilter] = useState<CampusFilter>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customLogo, setCustomLogo] = useState<string | null>(() => {
    try {
      return localStorage.getItem(LOGO_STORAGE_KEY);
    } catch {
      return null;
    }
  });

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

  function handleLogoUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomLogo(reader.result);
        try {
          localStorage.setItem(LOGO_STORAGE_KEY, reader.result);
        } catch {
          // Ignore storage quota errors
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function resetCustomLogo() {
    setCustomLogo(null);
    try {
      localStorage.removeItem(LOGO_STORAGE_KEY);
    } catch {
      // Ignore storage failures
    }
  }

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
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#242424]">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/svg+xml,image/jpeg"
        onChange={handleLogoUpload}
        className="hidden"
        aria-label="Upload official KeMU logo file"
      />

      {/* Navigation Bar */}
      <header className="no-print sticky top-0 z-50 bg-[#871054] text-white border-b-[3px] border-[#D6B34A] shadow-sm">
        <div className="max-w-[1040px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D6B34A] rounded-lg min-w-0"
          >
            <KemuLogo
              src={customLogo}
              size="md"
              onRequestUpload={() => fileInputRef.current?.click()}
            />
            <div className="min-w-0">
              <span className="font-heading block text-sm sm:text-lg font-bold tracking-tight text-white truncate">
                Kenya Methodist University
              </span>
              <span className="block text-[11px] sm:text-xs text-[#FDF6DC] font-medium whitespace-nowrap">
                TVET Institute · The Future is Here
              </span>
            </div>
          </button>

          <nav className="flex items-center gap-2 shrink-0" aria-label="Primary">
            <button
              type="button"
              onClick={() => navigateTo("home")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 border min-h-[40px] ${
                page === "home"
                  ? "bg-[#D6B34A] text-[#242424] border-[#D6B34A]"
                  : "bg-white/10 text-white border-white/25 hover:bg-white/20"
              }`}
            >
              Select Units
            </button>
            <button
              type="button"
              onClick={() => navigateTo("results")}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 border min-h-[40px] ${
                page === "results"
                  ? "bg-[#D6B34A] text-[#242424] border-[#D6B34A]"
                  : "bg-white/10 text-white border-white/25 hover:bg-white/20"
              }`}
            >
              My Timetable
              {selectedCodes.length > 0 && (
                <span className="ml-1.5 tabular-nums opacity-95">
                  ({selectedCodes.length})
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      <main className="print-container flex-1 w-full max-w-[1040px] mx-auto px-4 sm:px-6 pt-6 pb-14">
        {page === "home" ? (
          <section aria-labelledby="select-units-heading">
            {/* Homepage Institutional Header with Authentic KeMU Logo */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 sm:p-7 mb-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
              <KemuLogo
                src={customLogo}
                size="lg"
                onRequestUpload={() => fileInputRef.current?.click()}
              />
              <div className="flex-1 min-w-0">
                <div className="inline-block bg-[#EBF3FC] text-[#164A83] text-xs font-semibold px-2.5 py-1 rounded-md mb-2">
                  End of Trimester 3, 2026 · Draft 2
                </div>
                <h1
                  id="select-units-heading"
                  className="font-heading text-xl sm:text-2xl font-bold text-[#871054] tracking-tight text-balance mb-1"
                >
                  Build Your Personal Exam Timetable
                </h1>
                <p className="text-sm text-[#6B7280] max-w-[600px]">
                  Filter by campus or paper type and select your units. The
                  system automatically detects time collisions and highlights
                  practical exams.
                </p>
              </div>
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
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors duration-150 min-h-[42px] ${
                      active
                        ? "bg-[#871054] border-[#871054] text-white shadow-sm"
                        : "bg-white border-[#E5E7EB] text-[#242424] hover:border-[#871054] hover:text-[#871054]"
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
                  {
                    id: "ALL",
                    label: "All Papers",
                    activeClass: "bg-[#871054] border-[#871054] text-white",
                  },
                  {
                    id: "THEORY",
                    label: "Theory Only",
                    activeClass: "bg-[#164A83] border-[#164A83] text-white",
                  },
                  {
                    id: "PRACTICAL",
                    label: "Practical Only",
                    activeClass: "bg-[#D6B34A] border-[#D6B34A] text-[#242424]",
                  },
                ] as { id: TypeFilter; label: string; activeClass: string }[]
              ).map((item) => {
                const active = typeFilter === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTypeFilter(item.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 border transition-colors duration-150 min-h-[42px] ${
                      active
                        ? `${item.activeClass} shadow-sm`
                        : "bg-white border-[#E5E7EB] text-[#6B7280] hover:border-[#164A83] hover:text-[#164A83]"
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
                className="w-4 h-4 text-[#6B7280] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by unit code, title, or venue..."
                aria-label="Search units"
                className="w-full pl-11 pr-10 py-3 bg-white border border-[#E5E7EB] rounded-xl text-sm sm:text-base text-[#242424] placeholder:text-[#6B7280] shadow-sm focus:outline-none focus:border-[#871054] focus:ring-3 focus:ring-[#871054]/15 transition-shadow"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#6B7280] hover:text-[#242424] rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Live Practical Notice (Important Notice: light gold bg, dark readable text) */}
            {selectedPracticals.length > 0 && (
              <div
                role="status"
                className="mb-4 rounded-xl border border-[#D6B34A] bg-[#FDF6DC] px-4 py-3.5 text-sm text-[#242424] shadow-sm"
              >
                <div className="flex items-center gap-2 font-semibold mb-1.5 text-[#242424]">
                  <FlaskConical
                    className="w-4 h-4 shrink-0 text-[#871054]"
                    aria-hidden="true"
                  />
                  <span>Practical exams in your selection</span>
                </div>
                <ul className="list-disc pl-5 space-y-1">
                  {selectedPracticals.map((exam) => (
                    <li key={exam.code}>
                      <span className="font-bold text-[#871054]">
                        {exam.code}
                      </span>{" "}
                      — {exam.day.split(",")[0]} at {exam.time} (
                      {CAMPUS_NAMES[exam.campus]})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="bg-[#EBF3FC] text-[#164A83] border border-[#164A83]/20 px-4 py-2.5 rounded-lg text-sm font-semibold tabular-nums">
                {selectedCodes.length}{" "}
                {selectedCodes.length === 1 ? "unit" : "units"} selected
              </div>
              <button
                type="button"
                disabled={selectedCodes.length === 0}
                onClick={() => navigateTo("results")}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#871054] text-white hover:bg-[#6D0D44] disabled:bg-[#6B7280]/50 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[42px] shadow-sm"
              >
                <span>Generate My Timetable</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={clearSelection}
                disabled={selectedCodes.length === 0}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#871054] border border-[#871054] hover:bg-[#FDF6DC]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 whitespace-nowrap shrink-0 min-h-[42px]"
              >
                Clear All
              </button>
              <span className="ml-auto text-xs text-[#6B7280] tabular-nums">
                Showing {filteredExams.length} of {EXAMS.length} papers
              </span>
            </div>

            {/* Unit List */}
            {filteredExams.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm text-center py-12 px-5 text-[#6B7280]">
                <h2 className="font-heading text-base font-semibold text-[#242424] mb-1">
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
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#871054] text-white hover:bg-[#6D0D44] transition-colors"
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
                      className={`flex items-start gap-3.5 p-4 rounded-xl border shadow-sm cursor-pointer transition-colors duration-150 ${
                        isSelected
                          ? "bg-[#FDF6DC] border-[#D6B34A]"
                          : "bg-white border-[#E5E7EB] hover:border-[#871054]/50"
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
                              ? "bg-[#871054] border-[#871054] text-white"
                              : "bg-white border-[#6B7280]/50"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          )}
                        </span>
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="font-bold text-sm sm:text-[0.95rem] text-[#871054]">
                            {exam.code}
                          </span>
                          <span className="text-[#E5E7EB]" aria-hidden="true">
                            ·
                          </span>
                          {exam.practical ? (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#FDF6DC] text-[#242424] border border-[#D6B34A]">
                              Practical
                            </span>
                          ) : (
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#164A83]">
                              Theory
                            </span>
                          )}
                          <span className="text-[#E5E7EB]" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-xs font-medium text-[#164A83]">
                            {CAMPUS_NAMES[exam.campus]} ({exam.campus})
                          </span>
                        </div>

                        <div className="text-sm sm:text-[0.95rem] font-semibold text-[#242424] mt-1">
                          {exam.title}
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#6B7280]">
                          <span className="inline-flex items-center gap-1.5">
                            <Calendar
                              className="w-3.5 h-3.5 text-[#164A83]"
                              aria-hidden="true"
                            />
                            <span>{exam.day.split(",")[0]}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5 tabular-nums">
                            <Clock
                              className="w-3.5 h-3.5 text-[#164A83]"
                              aria-hidden="true"
                            />
                            <span>{exam.time}</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin
                              className="w-3.5 h-3.5 text-[#164A83]"
                              aria-hidden="true"
                            />
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
            {/* Official Timetable & Printable Report Header */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm p-5 mb-5 flex flex-col sm:flex-row sm:items-center gap-4">
              <KemuLogo
                src={customLogo}
                size="lg"
                onRequestUpload={() => fileInputRef.current?.click()}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-[#164A83] mb-0.5">
                  Kenya Methodist University · TVET Institute
                </p>
                <h1
                  id="timetable-heading"
                  className="font-heading text-xl sm:text-2xl font-bold text-[#871054] tracking-tight"
                >
                  Your Personal Exam Timetable
                </h1>
                <p className="text-sm text-[#6B7280] mt-0.5">
                  End of Trimester 3, 2026 · Draft 2
                </p>
              </div>
            </div>

            {selectedExams.length === 0 ? (
              <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-sm text-center py-14 px-6">
                <h2 className="font-heading text-lg font-semibold text-[#242424] mb-1.5">
                  No units selected yet
                </h2>
                <p className="text-sm text-[#6B7280] max-w-md mx-auto mb-5">
                  Select your registered units from the exam schedule to generate
                  your personal timetable and check for any time collisions.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo("home")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#871054] text-white hover:bg-[#6D0D44] transition-colors min-h-[42px]"
                >
                  <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                  <span>Select Units</span>
                </button>
              </div>
            ) : (
              <>
                {/* Summary Strip */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-sm text-center">
                    <div className="font-heading text-xl sm:text-2xl font-bold text-[#871054] tabular-nums">
                      {selectedExams.length}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      Total Exams
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-sm text-center">
                    <div className="font-heading text-xl sm:text-2xl font-bold text-[#164A83] tabular-nums">
                      {selectedPracticals.length}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      Practical Papers
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E5E7EB] shadow-sm text-center">
                    <div className="font-heading text-xl sm:text-2xl font-bold text-[#871054] tabular-nums">
                      {clashGroups.length}
                    </div>
                    <div className="text-xs text-[#6B7280] mt-0.5">
                      Time Collisions
                    </div>
                  </div>
                </div>

                {/* Practical Exam Important Notice */}
                {selectedPracticals.length > 0 && (
                  <div className="mb-4 rounded-xl border border-[#D6B34A] bg-[#FDF6DC] p-4 text-sm text-[#242424] shadow-sm">
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-[#242424]">
                      <FlaskConical
                        className="w-4 h-4 shrink-0 text-[#871054]"
                        aria-hidden="true"
                      />
                      <span>You have Practical Exam(s)</span>
                    </div>
                    <ul className="list-disc pl-5 space-y-1">
                      {selectedPracticals.map((exam) => (
                        <li key={exam.code}>
                          <span className="font-bold text-[#871054]">
                            {exam.code}
                          </span>{" "}
                          – {exam.day.split(",")[0]} at{" "}
                          <strong className="tabular-nums">{exam.time}</strong>{" "}
                          ({CAMPUS_NAMES[exam.campus]}, {exam.venue})
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-[#6B7280]">
                      Make sure you are prepared and seated early for these
                      practical lab sessions.
                    </p>
                  </div>
                )}

                {/* Colliding Units Important Notice */}
                {clashGroups.length > 0 && (
                  <div
                    role="alert"
                    className="mb-5 rounded-xl border-2 border-[#D6B34A] bg-[#FDF6DC] p-4 text-sm text-[#242424] shadow-sm"
                  >
                    <div className="flex items-center gap-2 font-bold mb-1.5 text-[#871054]">
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
                              <strong className="text-[#871054]">
                                {exam.code}
                              </strong>{" "}
                              ({CAMPUS_NAMES[exam.campus]})
                            </span>
                          ))}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-[#6B7280]">
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
                        <div className="flex flex-wrap items-center gap-2.5 pb-2 mb-3 border-b-2 border-[#D6B34A]">
                          <h2 className="font-heading text-lg font-bold text-[#871054]">
                            {dayName}
                          </h2>
                          {datePart && (
                            <span className="bg-[#871054] text-white text-xs font-semibold px-2.5 py-1 rounded-md">
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
                                className={`print-card rounded-xl p-4 border shadow-sm transition-colors ${
                                  isClash
                                    ? "bg-[#FDF6DC] border-[#D6B34A]"
                                    : "bg-white border-[#E5E7EB]"
                                }`}
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                                  <span className="text-xs sm:text-sm font-semibold text-[#164A83] bg-[#EBF3FC] px-2.5 py-1 rounded-md tabular-nums">
                                    {exam.time}
                                  </span>

                                  <div className="flex flex-wrap items-center gap-2 text-xs">
                                    {isClash && (
                                      <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-[#871054] text-white">
                                        <AlertTriangle
                                          className="w-3.5 h-3.5"
                                          aria-hidden="true"
                                        />
                                        Time Collision
                                      </span>
                                    )}
                                    {exam.practical ? (
                                      <span className="font-semibold px-2 py-0.5 rounded bg-[#FDF6DC] text-[#242424] border border-[#D6B34A]">
                                        Practical
                                      </span>
                                    ) : (
                                      <span className="font-semibold px-2 py-0.5 rounded bg-[#EBF3FC] text-[#164A83]">
                                        Theory
                                      </span>
                                    )}
                                    <span className="font-medium text-[#6B7280]">
                                      {CAMPUS_NAMES[exam.campus]}
                                    </span>
                                  </div>
                                </div>

                                <div className="font-bold text-sm sm:text-base text-[#871054]">
                                  {exam.code}
                                </div>
                                <h3 className="font-heading text-sm sm:text-[0.95rem] font-semibold text-[#242424] mt-0.5">
                                  {exam.title}
                                </h3>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-[#E5E7EB] pt-3 mt-3 text-sm">
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#164A83] tracking-wide mb-0.5">
                                      Campus
                                    </span>
                                    <span className="text-[#242424]">
                                      {CAMPUS_NAMES[exam.campus]} ({exam.campus})
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#164A83] tracking-wide mb-0.5">
                                      Venue
                                    </span>
                                    <span className="text-[#242424]">
                                      {exam.venue}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="block text-[0.7rem] font-semibold text-[#164A83] tracking-wide mb-0.5">
                                      Invigilator
                                    </span>
                                    <span className="text-[#242424]">
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
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-[#871054] border border-[#871054] hover:bg-[#FDF6DC]/50 transition-colors whitespace-nowrap shrink-0 min-h-[42px]"
                  >
                    <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    <span>Edit Units</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-[#871054] text-white hover:bg-[#6D0D44] transition-colors whitespace-nowrap shrink-0 min-h-[42px] shadow-sm"
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

      <footer className="no-print text-center py-6 px-5 text-xs border-t-[3px] border-[#D6B34A] bg-[#871054] text-white/90">
        <div className="max-w-[1040px] mx-auto flex flex-col items-center gap-2">
          <div>
            <strong className="text-[#FDF6DC] font-semibold">
              Kenya Methodist University
            </strong>{" "}
            – TVET Institute
            <br />
            End of Trimester 3, 2026 Exam Timetable (Draft 2) · Laborare est Orare
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-[11px] text-[#FDF6DC] hover:underline"
            >
              <Upload className="w-3 h-3" aria-hidden="true" />
              <span>Upload Official Logo (PNG/SVG)</span>
            </button>
            {customLogo && (
              <button
                type="button"
                onClick={resetCustomLogo}
                className="inline-flex items-center gap-1 text-[11px] text-white/80 hover:text-white hover:underline"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>Restore Default Crest</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
