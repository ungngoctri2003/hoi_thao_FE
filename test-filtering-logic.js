// Test script to verify filtering logic
console.log("🧪 Testing filtering logic...");

// Mock data
const usersWithMessages = [
  { id: 1, name: "User 1" },
  { id: 2, name: "User 2" },
  { id: "3", name: "User 3" }, // String ID
];

const processedUsers = [
  { id: 1, name: "User 1" },
  { id: 2, name: "User 2" },
  { id: 3, name: "User 3" },
  { id: 4, name: "User 4" },
  { id: 5, name: "User 5" },
  { id: "6", name: "User 6" }, // String ID
];

console.log("📨 Users with messages:", usersWithMessages);
console.log("👥 Processed users:", processedUsers);

// Test the filtering logic
const existingUserIds = new Set(
  usersWithMessages.map((user) => Number(user.id))
);

console.log("🔍 Existing user IDs:", Array.from(existingUserIds));

const filteredUsers = processedUsers.filter((user) => {
  const userId = Number(user.id);
  const isExisting = existingUserIds.has(userId);
  console.log(
    `User ${user.name} (ID: ${user.id} -> ${userId}) - isExisting: ${isExisting}`
  );
  return !isExisting;
});

console.log("✅ Final filtered users:", filteredUsers);
console.log("📊 Count:", filteredUsers.length);
