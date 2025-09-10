// Debug script for search issue
const API_BASE_URL = "http://localhost:4000";

async function debugSearchIssue() {
  try {
    console.log("🔍 Debugging search issue...");

    // Get all users
    const response = await fetch(`${API_BASE_URL}/messaging/users-by-category`);
    const data = await response.json();

    console.log(`\n📊 Total users: ${data.data?.length || 0}`);

    // Check for duplicates by email
    const emailCounts = {};
    const duplicateEmails = [];

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
          conferenceName: user.CONFERENCE_NAME || user.conferenceName,
        });
      }
    });

    // Find duplicates
    Object.keys(emailCounts).forEach((email) => {
      if (emailCounts[email].length > 1) {
        duplicateEmails.push({ email, users: emailCounts[email] });
      }
    });

    console.log(`\n🔍 Duplicate emails found: ${duplicateEmails.length}`);
    duplicateEmails.forEach((dup) => {
      console.log(`\n📧 Email: ${dup.email}`);
      dup.users.forEach((user, i) => {
        console.log(
          `  ${i + 1}. ${user.name} (${user.role}) - ${user.category} - ${
            user.conferenceName || "N/A"
          }`
        );
      });
    });

    // Test search functionality
    console.log(`\n🔍 Testing search for "triung8":`);
    const searchTerm = "triung8";
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

    console.log(
      `Found ${searchResults?.length || 0} results for "${searchTerm}":`
    );
    searchResults?.forEach((user, i) => {
      console.log(
        `  ${i + 1}. ${user.NAME || user.name} (${
          user.EMAIL || user.email
        }) - ${user.role} - ${user.CATEGORY || user.category}`
      );
    });

    // Test search for different name
    console.log(`\n🔍 Testing search for "admin":`);
    const searchTerm2 = "admin";
    const searchResults2 = data.data?.filter((user) => {
      const name = (user.NAME || user.name || "").toLowerCase();
      const email = (user.EMAIL || user.email || "").toLowerCase();
      const conferenceName = (
        user.CONFERENCE_NAME ||
        user.conferenceName ||
        ""
      ).toLowerCase();

      return (
        name.includes(searchTerm2.toLowerCase()) ||
        email.includes(searchTerm2.toLowerCase()) ||
        conferenceName.includes(searchTerm2.toLowerCase())
      );
    });

    console.log(
      `Found ${searchResults2?.length || 0} results for "${searchTerm2}":`
    );
    searchResults2?.forEach((user, i) => {
      console.log(
        `  ${i + 1}. ${user.NAME || user.name} (${
          user.EMAIL || user.email
        }) - ${user.role} - ${user.CATEGORY || user.category}`
      );
    });
  } catch (error) {
    console.error("❌ Debug failed:", error);
  }
}

debugSearchIssue();
