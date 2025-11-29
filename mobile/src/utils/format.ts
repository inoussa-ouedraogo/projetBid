import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export const formatCurrency = (
  value?: number | null,
  currency = 'EUR'
): string => {
  if (value === null || value === undefined) {
    return '--';
  }
  return Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (iso?: string | null) =>
  iso ? dayjs(iso).format('DD MMM YYYY HH:mm') : '--';

export const formatRelative = (iso?: string | null) =>
  iso ? dayjs(iso).fromNow() : '--';

export const formatCity = (name?: string | null) => {
  if (!name) return '';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const deriveAuctionStatus = (start?: string, end?: string) => {
  if (!start || !end) {
    return 'Aucune date';
  }
  const now = dayjs();
  if (now.isBefore(dayjs(start))) {
    return `Debute ${dayjs(start).fromNow()}`;
  }
  if (now.isAfter(dayjs(end))) {
    return `Termine ${dayjs(end).fromNow()}`;
  }
  const duration = dayjs(end).diff(now, 'minute');
  return `Se termine dans ${duration} min`;
};
