"use client";

const FRIENDS = [
  { name: "Alex K", status: "Joined Coffee at Devoción" },
  { name: "Morgan L", status: "Joined Rooftop Sunset" },
  { name: "Sam R", status: "Joined Central Park Walk" },
  { name: "Jordan L", status: "Joined Central Park Walk" },
  { name: "Riley M", status: "Free this weekend" },
  { name: "Casey T", status: "Down for coffee" },
];

export default function FriendsView() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-1">
        <h2 className="text-sm font-medium text-gray-500 px-2 mb-3">Friends</h2>
        {FRIENDS.map((friend) => (
          <div
            key={friend.name}
            className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
              {friend.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{friend.name}</p>
              <p className="text-sm text-gray-500 truncate">{friend.status}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
