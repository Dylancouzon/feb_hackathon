"use client";

const FRIENDS = [
  {
    name: "Alex K",
    status: "Joined Coffee at Devoción",
    interests: ["Coffee", "Remote work", "Low-key"],
    showsUp: 98,
    communityRating: 4.8,
  },
  {
    name: "Morgan L",
    status: "Joined Rooftop Sunset",
    interests: ["Rooftops", "Bars", "Sunset"],
    showsUp: 92,
    communityRating: 4.6,
  },
  {
    name: "Sam R",
    status: "Joined Central Park Walk",
    interests: ["Outdoors", "Running", "Coffee"],
    showsUp: 100,
    communityRating: 4.9,
  },
  {
    name: "Jordan L",
    status: "Joined Central Park Walk",
    interests: ["Outdoors", "Brunch", "Dogs"],
    showsUp: 88,
    communityRating: 4.5,
  },
  {
    name: "Riley M",
    status: "Free this weekend",
    interests: ["Bars", "Live music", "Food"],
    showsUp: 95,
    communityRating: 4.7,
  },
  {
    name: "Casey T",
    status: "Down for coffee",
    interests: ["Coffee", "Outdoors", "Books"],
    showsUp: 90,
    communityRating: 4.4,
  },
];

export default function FriendsView() {
  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="p-4 space-y-3">
        <h2 className="text-sm font-medium text-gray-500 px-2 mb-1">Community</h2>
        {FRIENDS.map((friend) => (
          <div
            key={friend.name}
            className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-accent/20 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
                {friend.name.slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{friend.name}</p>
                <p className="text-sm text-gray-500 truncate">{friend.status}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {friend.interests.map((interest) => (
                <span
                  key={interest}
                  className="inline-block px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700"
                >
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
              <span className="text-xs font-medium text-emerald-600">
                ShowUp {friend.showsUp}%
              </span>
              <span className="text-xs font-medium text-amber-600">
                Vibe {friend.communityRating}/5
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
