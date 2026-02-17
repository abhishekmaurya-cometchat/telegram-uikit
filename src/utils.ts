export const formatTime = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  return `${formattedHours}:${formattedMinutes} ${period}`;
};

export function formatLastSeen(timestamp: number) {
  if (!timestamp) return "last seen recently";

  const date = new Date(timestamp * 1000);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return (
      "last seen " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
      })
    );
  }

  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return "last seen yesterday";
  }

  return (
    "last seen " +
    date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
    })
  );
}
