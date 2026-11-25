export const asset = (p: string) => import.meta.env.BASE_URL + p.replace(/^\//, "");

const PATHS: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  list: "M4 6h16M4 12h16M4 18h10",
  cube: "M12 3l8 4.5v9L12 21l-8-4.5v-9zM12 12l8-4.5M12 12v9M12 12L4 7.5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  up: "M12 19V5M6 11l6-6 6 6",
  down: "M12 5v14M6 13l6 6 6-6",
  lift: "M5 3h14v18H5zM12 3v18M8.5 9l-1.5 2h3zM15.5 15l1.5-2h-3z",
  x: "M6 6l12 12M18 6L6 18",
  ext: "M14 5h5v5M19 5l-8 8M11 7H6v11h11v-5",
  zoom: "M11 4a7 7 0 100 14 7 7 0 000-14zM16 16l4 4M11 8v6M8 11h6",
  sound: "M4 9v6h4l5 4V5L8 9zM16.500 8.500a5 5 0 010 7M19 6a8.500 8.500 0 010 12",
  mute: "M4 9v6h4l5 4V5L8 9zM17 9.500l5 5M22 9.500l-5 5",
  pin: "M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.800 7 11 7 11zM12 7.500a2.500 2.500 0 100 5 2.500 2.500 0 000-5z",
};

export function Icon({ name }: { name: keyof typeof PATHS | string }) {
  return (
    <svg class={`ico ico-${name}`} viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d={PATHS[name] ?? ""} />
    </svg>
  );
}
