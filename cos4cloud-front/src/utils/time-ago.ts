export const timeAgo = (value: Date | string) => {
  const d = new Date(value);
  const now = new Date();
  const seconds = Math.round(Math.abs((now.getTime() - d.getTime()) / 1000));
  const minutes = Math.round(Math.abs(seconds / 60));
  const hours = Math.round(Math.abs(minutes / 60));
  const days = Math.round(Math.abs(hours / 24));
  const years = Math.round(Math.abs(days / 365));

  if (Number.isNaN(seconds)){
    return '';
  } else if (seconds <= 30) {
    return 'seconds ago';
  } else if (seconds <= 45) {
    return '<1s';
  } else if (seconds <= 90) {
    return '1m';
  } else if (minutes <= 45) {
    return minutes + 'm';
  } else if (minutes <= 90) {
    return '1h';
  } else if (hours <= 22) {
    return hours + 'h';
  } else if (hours <= 36) {
    return '1d';
  } else if (days <= 345) {
    return days + 'd';
  } else if (days <= 545) {
    return '1y';
  } else {
    return years + 'y';
  }
}