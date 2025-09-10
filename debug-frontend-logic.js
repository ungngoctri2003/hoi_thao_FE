// Debug frontend deduplicate logic
function deduplicateUsers(users) {
  console.log("🔍 Input users:", users.length);

  const uniqueUsers = new Map();
  users.forEach((user, index) => {
    const email = user.email;
    console.log(`Processing user ${index + 1}: ${user.name} (${email})`);

    if (email && !uniqueUsers.has(email)) {
      uniqueUsers.set(email, user);
      console.log(`  ✅ Added to unique users`);
    } else if (email && uniqueUsers.has(email)) {
      console.log(`  ⚠️  Duplicate email found: ${email}`);
      const existing = uniqueUsers.get(email);
      console.log(`  Existing: ${existing.name} (${existing.userType})`);
      console.log(`  Current: ${user.name} (${user.userType})`);

      // If both app_user and attendee exist, keep app_user
      if (existing.userType === "attendee" && user.userType === "app_user") {
        uniqueUsers.set(email, user);
        console.log(`  ✅ Replaced with app_user`);
      } else {
        console.log(`  ❌ Kept existing user`);
      }
    } else {
      console.log(`  ❌ No email found for user: ${user.name}`);
    }
  });

  const result = Array.from(uniqueUsers.values());
  console.log(`🔍 Output users: ${result.length}`);
  return result;
}

// Test with sample data that might cause issues
const testUsers = [
  { id: 1, name: "User 1", email: "test1@example.com", userType: "app_user" },
  { id: 2, name: "User 2", email: "test2@example.com", userType: "attendee" },
  { id: 3, name: "User 3", email: "test1@example.com", userType: "attendee" }, // Duplicate email
  { id: 4, name: "User 4", email: "test3@example.com", userType: "app_user" },
  { id: 5, name: "User 5", email: "", userType: "app_user" }, // No email
  { id: 6, name: "User 6", email: "test2@example.com", userType: "app_user" }, // Duplicate email
];

console.log("🧪 Testing deduplicate logic:");
const result = deduplicateUsers(testUsers);

console.log("\n📊 Final result:");
result.forEach((user, index) => {
  console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.userType}`);
});
