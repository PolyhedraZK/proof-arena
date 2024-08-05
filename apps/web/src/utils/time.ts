import dayjs from 'dayjs';

// import 'dayjs/locale/en';

export const formatTimeAgoString = timestamp => {
  const diff = dayjs().diff(timestamp, 'minute');

  if (diff < 1) {
    return 'Now';
  }
  if (diff < 60) {
    return `${diff} minute${diff > 1 ? 's' : ''} ago`;
  }
  if (diff < 1440) {
    return `${Math.floor(diff / 60)} hour${Math.floor(diff / 60) > 1 ? 's' : ''} ago`;
  }
  if (diff < 5760) {
    return `${Math.floor(diff / 1440)} day${Math.floor(diff / 1440) > 1 ? 's' : ''} ago`;
  }
  return dayjs(timestamp).locale('en').format('MMM D, YYYY');
};

export const formatTimeToUTCStr = timestamp => {
  if (!timestamp) {
    return '-';
  }
  const time = dayjs(timestamp);
  return time.locale('en').format('MMM D, YYYY, HH:mm:ss (UTCZ)');
};
