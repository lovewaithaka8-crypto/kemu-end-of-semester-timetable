export type CampusCode = "NRB" | "MSA" | "MTC";

export interface ExamUnit {
  code: string;
  title: string;
  date: string;
  day: string;
  time: string;
  campus: CampusCode;
  venue: string;
  invigilator: string;
  practical: boolean;
}

export const CAMPUS_NAMES: Record<CampusCode, string> = {
  NRB: "Nairobi",
  MSA: "Mombasa",
  MTC: "Meru",
};

export const EXAMS: ExamUnit[] = [
  { code: "DIGL 005", title: "Digital Literacy", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MSA", venue: "Hall 2", invigilator: "Austine", practical: false },
  { code: "ITCR 045", title: "Database Systems Introduction Practical", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "COMP LAB", invigilator: "Austine", practical: true },
  { code: "ITCR 076", title: "Database Systems Management I Practical", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "COMP LAB", invigilator: "Allan", practical: true },
  { code: "ITCR 055", title: "Computer Programs Development I Practical", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "COMP LAB", invigilator: "Wycliffe", practical: true },
  { code: "ITCR 176", title: "Computer Programs Development II Practical", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MSA", venue: "COMP LAB", invigilator: "Allan", practical: true },
  { code: "ITCC 046", title: "Statistical Software and Data Analysis Practical", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "COMP LAB", invigilator: "Romeo", practical: true },
  { code: "BMCR 096", title: "Coordinating Business Development", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "PA", invigilator: "Winifred", practical: false },
  { code: "HICC 036", title: "Community Health", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "Main Hall", invigilator: "Caroline", practical: false },
  { code: "LICC 136", title: "Information Law and Policy", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "PA", invigilator: "Stephen", practical: false },
  { code: "ITCR 206", title: "Computer Programs Development II Theory", date: "2026-11-30", day: "Monday, 30 November 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "LR1", invigilator: "Jeremiah", practical: false },
  { code: "ITCR 035", title: "Computer Repair and Maintenance", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "MTC", venue: "Main Hall", invigilator: "Christine", practical: false },
  { code: "COMS 005", title: "Communication Skills", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "NRB", venue: "PA", invigilator: "Wycliffe", practical: false },
  { code: "ITCR 176B", title: "Database Management I Theory", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "MSA", venue: "Hall 2", invigilator: "Sylvia", practical: false },
  { code: "BMCR 076", title: "Controlling Business Risk", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "MSA", venue: "Hall 2", invigilator: "Tower", practical: false },
  { code: "LICR 036", title: "Search of Library and Information Database", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "NRB", venue: "Main Hall", invigilator: "Lewis", practical: false },
  { code: "ENTR 006", title: "Entrepreneurial Skills", date: "2026-11-30", day: "Monday, 30 November 2026", time: "2:30 PM – 4:30 PM", campus: "NRB", venue: "PA", invigilator: "Alore", practical: false },
  { code: "EMPL 006", title: "Employability Skills", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "Main Hall", invigilator: "Martin", practical: false },
  { code: "CHCR 065", title: "Gender disability and vulnerable Groups", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "MSA", venue: "Hall 2", invigilator: "Brian", practical: false },
  { code: "ACCR 036", title: "Financial Accounting", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "MSA", venue: "Hall 2", invigilator: "Denis", practical: false },
  { code: "NDCC 066", title: "Nutrition Anthropology", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "LR1", invigilator: "Fredrick", practical: false },
  { code: "BMCR 146", title: "Corporate Image Development II", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "NRB", venue: "PA", invigilator: "Martin", practical: false },
  { code: "ITCR 026", title: "Software Installation", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "Main Hall", invigilator: "Christine", practical: false },
  { code: "BMCR 016", title: "Business Research and Development", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "11:30 AM – 1:30 PM", campus: "NRB", venue: "PA", invigilator: "Joy", practical: false },
  { code: "ACCR 015", title: "Principles of Accounting", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "11:30 AM – 1:30 PM", campus: "MSA", venue: "Hall 2", invigilator: "Bernard", practical: false },
  { code: "TMCR 086", title: "Tour and travel office operations management", date: "2026-12-01", day: "Tuesday, 1 December 2026", time: "11:30 AM – 1:30 PM", campus: "MSA", venue: "Hall 2", invigilator: "Jane", practical: false },
  { code: "ITCC 046B", title: "Statistical software and Data analysis Theory", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "Main Hall", invigilator: "Romeo", practical: false },
  { code: "FBCR 015", title: "Introduction to hospitality", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "9:00 AM – 11:00 AM", campus: "NRB", venue: "PA", invigilator: "Wycliffe", practical: false },
  { code: "SWCC 066", title: "Legal Aspects of social work", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "9:00 AM – 11:00 AM", campus: "MSA", venue: "Hall 2", invigilator: "Brian", practical: false },
  { code: "ACCR 026", title: "Business mathematics and statistics", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "9:00 AM – 11:00 AM", campus: "NRB", venue: "PA", invigilator: "Meshack", practical: false },
  { code: "ITCC 016", title: "Basic Electronics", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "2:30 PM – 4:30 PM", campus: "MSA", venue: "Hall 2", invigilator: "Jeremiah", practical: false },
  { code: "BMCR 016B", title: "Business strategy development", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "2:30 PM – 4:30 PM", campus: "NRB", venue: "PA", invigilator: "Romeo", practical: false },
  { code: "PMCR 046", title: "Project financing", date: "2026-12-03", day: "Wednesday, 3 December 2026", time: "2:30 PM – 4:30 PM", campus: "MTC", venue: "LR1", invigilator: "Kenneth", practical: false },
  { code: "ITCC 015", title: "Web Design and Development I", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "MSA", venue: "Hall 2", invigilator: "Jeremiah", practical: false },
  { code: "NUMS 005", title: "Numeracy Skills", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "LR1", invigilator: "Dr. Panga / Jackline", practical: false },
  { code: "CHCR 015", title: "Community health care", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "MSA", venue: "Hall 2", invigilator: "Kiprono", practical: false },
  { code: "AGCC 076", title: "Mushroom production", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "MTC", venue: "LR1", invigilator: "Crispin", practical: false },
  { code: "PSMC 076", title: "Forecasting and strategy management", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "PA", invigilator: "Joy", practical: false },
  { code: "HICR 105", title: "Vegetable crop production", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "PA", invigilator: "Bernard", practical: false },
  { code: "BMCR 166", title: "Financial Operations Management II", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "NRB", venue: "PA", invigilator: "Bernard", practical: false },
  { code: "ITCR 316", title: "Mobile Applications Theory", date: "2026-12-03", day: "Thursday, 3 December 2026", time: "9:30 AM – 11:30 AM", campus: "MSA", venue: "Hall 2", invigilator: "Lewis", practical: false },
  { code: "PSMC 096", title: "Warehousing operations and stock control", date: "2026-12-04", day: "Friday, 4 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "Main Hall", invigilator: "Sylvia", practical: false },
  { code: "ACCR 056", title: "Crop protection", date: "2026-12-04", day: "Friday, 4 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "LR1", invigilator: "Kiprono", practical: false },
  { code: "BMCR 126", title: "Managing Human Resource II", date: "2026-12-04", day: "Friday, 4 December 2026", time: "9:00 AM – 11:00 AM", campus: "NRB", venue: "PA", invigilator: "Florence", practical: false },
  { code: "ITCR 036", title: "ICT Security I", date: "2026-12-04", day: "Friday, 4 December 2026", time: "9:00 AM – 11:00 AM", campus: "MTC", venue: "LR1", invigilator: "Christine", practical: false },
  { code: "CHCC 096", title: "Communicable And Non-Communicable Disease", date: "2026-12-04", day: "Friday, 4 December 2026", time: "9:00 AM – 11:00 AM", campus: "MSA", venue: "Hall 2", invigilator: "Wycliffe", practical: false },
  { code: "ITCR 046", title: "IT Systems Support", date: "2026-12-04", day: "Friday, 4 December 2026", time: "2:00 PM – 5:00 PM", campus: "MSA", venue: "Hall 2", invigilator: "Jeremiah", practical: false },
  { code: "ACCC 036", title: "Quantitative Techniques", date: "2026-12-04", day: "Friday, 4 December 2026", time: "2:00 PM – 5:00 PM", campus: "NRB", venue: "PA", invigilator: "Bernard", practical: false },
  { code: "ITCR 216", title: "Mobile Application Development I", date: "2026-12-04", day: "Friday, 4 December 2026", time: "2:00 PM – 5:00 PM", campus: "MTC", venue: "LR1", invigilator: "Crispin", practical: false },
];

export function parseStartMinutes(timeRange: string): number {
  const startPart = timeRange.split("–")[0]?.trim() || "";
  const match = startPart.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}
