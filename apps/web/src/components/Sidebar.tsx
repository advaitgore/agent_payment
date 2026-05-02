import React from 'react';

export default function Sidebar({ children }: { children: React.ReactNode }) {
  return <aside className="sidebar">{children}</aside>;
}
