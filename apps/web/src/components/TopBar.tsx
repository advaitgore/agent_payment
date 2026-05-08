export type TopBarVariant = 'default' | 'with-search' | 'breadcrumb';

export default function TopBar({
  title,
  breadcrumb,
  searchPlaceholder,
  showSearch = false,
  variant = 'default',
  profileImageUrl,
  profileAlt = 'User profile',
}: {
  title: string;
  breadcrumb?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  variant?: TopBarVariant;
  profileImageUrl?: string;
  profileAlt?: string;
}) {
  return (
    <header className={`topbar topbar-${variant}`}>
      <div className="topbar-left">
        <span className="topbar-title">{title}</span>
        {breadcrumb && (
          <>
            <span className="topbar-sep">/</span>
            <span className="topbar-crumb">{breadcrumb}</span>
          </>
        )}
      </div>

      <div className="topbar-right">
        {showSearch && (
          <div className="topbar-search">
            <span className="material-symbols-outlined">search</span>
            <input placeholder={searchPlaceholder} type="text" />
          </div>
        )}
        <div className="topbar-icons">
          <span className="material-symbols-outlined">notifications</span>
          <span className="material-symbols-outlined">history</span>
          <span className="material-symbols-outlined">help_outline</span>
        </div>
        <div className="topbar-avatar">
          {profileImageUrl ? (
            <img alt={profileAlt} src={profileImageUrl} />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
        </div>
      </div>
    </header>
  );
}
