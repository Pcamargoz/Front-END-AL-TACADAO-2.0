interface SidebarProps {
  expanded?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ expanded = true, onToggle, isMobile = false }: SidebarProps = {}) {
  return (
    <aside className={`sidebar ${expanded ? "expanded" : "collapsed"} ${isMobile ? "mobile" : ""}`}>
      <div className="sidebar-content">
        <h3>Navigation</h3>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/produtos">Products</a></li>
          </ul>
        </nav>
        {onToggle && (
          <button onClick={onToggle} className="sidebar-toggle">
            Toggle
          </button>
        )}
      </div>
    </aside>
  );
}
