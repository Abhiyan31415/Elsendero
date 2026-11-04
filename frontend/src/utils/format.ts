/** Prices are in Nepalese rupees, e.g. "Rs 1,500"; 0 or missing is "Free". */
export const formatPrice = (price: number | null | undefined): string =>
  !price ? 'Free' : `Rs ${Number(price).toLocaleString('en-IN')}`;

const toDate = (value: string | Date | null | undefined): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "9 Nov 2026" (day first, month as a word, so it can't be misread). */
export const formatDate = (value: string | Date | null | undefined): string => {
  const d = toDate(value);
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
};

/** Compact range: "9–10 Nov 2026", "28 Nov – 2 Dec 2026", "30 Dec 2026 – 2 Jan 2027". */
export const formatDateRange = (from: string | Date | null | undefined, to: string | Date | null | undefined): string => {
  const a = toDate(from);
  const b = toDate(to);
  if (!a) return formatDate(b);
  if (!b || a.toDateString() === b.toDateString()) return formatDate(a);
  const sameYear = a.getFullYear() === b.getFullYear();
  if (sameYear && a.getMonth() === b.getMonth()) return `${a.getDate()}–${formatDate(b)}`;
  const start = a.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', ...(sameYear ? {} : { year: 'numeric' }) });
  return `${start} – ${formatDate(b)}`;
};

/** Rounds a price ceiling up to a tidy number for the slider (e.g. 6000 -> 6000, 1730 -> 2000). */
export const niceCeiling = (value: number): number => {
  if (value <= 0) return 1000;
  const step = 10 ** Math.max(Math.floor(Math.log10(value)) - 1, 0) * 5;
  return Math.ceil(value / step) * step;
};
