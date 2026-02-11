"use client";

export type TabId = "map" | "friends" | "chats";

type TabBarProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
};

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "map", label: "Map", icon: "🗺" },
  { id: "friends", label: "Friends", icon: "👥" },
  { id: "chats", label: "Activity Chats", icon: "💬" },
];

export default function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="flex items-center justify-around h-14 bg-white border-t border-gray-200 safe-area-pb">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`
            flex flex-col items-center justify-center gap-0.5 flex-1 h-full
            text-sm font-medium transition-colors
            ${activeTab === tab.id ? "text-accent" : "text-gray-500 hover:text-gray-700"}
          `}
        >
          <span className="text-lg leading-none">{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
