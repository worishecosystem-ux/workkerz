
export function formatDate(date: string | null): string {
  if (!date) return "Completed";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function getWorkTitle(
  ...values: (string | null | undefined)[]
): string {
  return (
    values.find((value) => value?.trim())?.trim() ||
    "Completed Work"
  );
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getImageCountLabel(count: number): string {
  return `${count} ${count === 1 ? "photo" : "photos"}`;
}
