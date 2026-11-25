/**
 * Re-mounts on every navigation inside the app, so each page eases in.
 * (A layout would persist between pages and only animate once.)
 */
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="gw-page">{children}</div>;
}
