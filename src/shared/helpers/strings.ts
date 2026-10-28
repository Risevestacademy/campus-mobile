export function getInitials(name: string, opt?: { onlyFirst?: boolean }) {
  const [firstName = "", lastName = ""] = name.trim().split(/\s+/);

  if (opt?.onlyFirst) return firstName.charAt(0);
  return `${firstName.charAt(0)}${lastName.charAt(0)}`;
}

export function capitalize(s: string) {
  if (s === "") return s;
  return s.charAt(0).toUpperCase() + s.substring(1);
}
