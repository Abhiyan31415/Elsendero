export const formatPrice = (price: number | null | undefined): string =>
  !price ? 'Free' : `$${Number(price)}`;

export const formatDate = (value: string | null | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString();
};
