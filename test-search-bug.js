// Test script to reproduce search bug
const API_BASE_URL = "http://localhost:4000";

async function testSearchBug() {
  try {
    console.log("🐛 Testing search bug...");

    // Get all users
    const response = await fetch(`${API_BASE_URL}/messaging/users-by-category`);
    const data = await response.json();

    console.log(`\n📊 Total users from API: ${data.data?.length || 0}`);

    // Test search for random name that should NOT match triung8@gmail.com
    const testSearches = [
      "linh tinh",
      "random name",
      "test user",
      "admin",
      "quan tri",
    ];

    testSearches.forEach((searchTerm) => {
      console.log(`\n🔍 Testing search for "${searchTerm}":`);

      const searchResults = data.data?.filter((user) => {
        const name = (user.NAME || user.name || "").toLowerCase();
        const email = (user.EMAIL || user.email || "").toLowerCase();
        const conferenceName = (
          user.CONFERENCE_NAME ||
          user.conferenceName ||
          ""
        ).toLowerCase();

        return (
          name.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          conferenceName.includes(searchTerm.toLowerCase())
        );
      });

      console.log(`Found ${searchResults?.length || 0} results:`);
      searchResults?.forEach((user, i) => {
        console.log(
          `  ${i + 1}. ${user.NAME || user.name} (${
            user.EMAIL || user.email
          }) - ${user.role}`
        );
      });

      // Check if triung8@gmail.com appears in results
      const triung8Results = searchResults?.filter(
        (user) => (user.EMAIL || user.email) === "triung8@gmail.com"
      );

      if (triung8Results && triung8Results.length > 0) {
        console.log(
          `❌ BUG: triung8@gmail.com appears ${triung8Results.length} times in search for "${searchTerm}"`
        );
        triung8Results.forEach((user, i) => {
          console.log(
            `    Bug ${i + 1}: ${user.NAME || user.name} (${
              user.EMAIL || user.email
            }) - ${user.role} - ${user.CATEGORY || user.category}`
          );
        });
      }
    });

    // Check for exact duplicates in raw data
    console.log(`\n🔍 Checking for exact duplicates in raw data:`);
    const emailCounts = {};
    data.data?.forEach((user, index) => {
      const email = user.EMAIL || user.email;
      if (email) {
        if (!emailCounts[email]) {
          emailCounts[email] = [];
        }
        emailCounts[email].push({
          index,
          name: user.NAME || user.name,
          email: email,
          role: user.role,
          category: user.CATEGORY || user.category,
        });
      }
    });

    Object.keys(emailCounts).forEach((email) => {
      if (emailCounts[email].length > 1) {
        console.log(
          `❌ DUPLICATE: ${email} appears ${emailCounts[email].length} times`
        );
        emailCounts[email].forEach((user, i) => {
          console.log(
            `    ${i + 1}. Index ${user.index}: ${user.name} (${user.role}) - ${
              user.category
            }`
          );
        });
      }
    });
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testSearchBug();
