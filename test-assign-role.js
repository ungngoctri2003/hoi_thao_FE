// Script to assign role to test user
const API_BASE_URL = "http://localhost:4000/api/v1";

async function assignRoleToUser() {
  try {
    console.log("🔍 Assigning role to test user...");

    // Step 1: Login as admin (if exists) or create admin user
    console.log("\n1. Trying to login as admin...");
    let adminToken = null;

    try {
      const adminLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "admin@example.com",
          password: "admin123",
        }),
      });

      if (adminLoginResponse.ok) {
        const adminData = await adminLoginResponse.json();
        adminToken = adminData.data?.accessToken;
        console.log("✅ Admin login successful");
      } else {
        console.log("❌ Admin login failed, trying to create admin user...");

        // Try to register admin user
        const adminRegisterResponse = await fetch(
          `${API_BASE_URL}/auth/register`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: "admin@example.com",
              name: "Admin User",
              password: "admin123",
            }),
          }
        );

        if (adminRegisterResponse.ok) {
          console.log("✅ Admin user created, trying to login...");
          const adminLoginResponse2 = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: "admin@example.com",
                password: "admin123",
              }),
            }
          );

          if (adminLoginResponse2.ok) {
            const adminData2 = await adminLoginResponse2.json();
            adminToken = adminData2.data?.accessToken;
            console.log("✅ Admin login successful after creation");
          }
        }
      }
    } catch (error) {
      console.log("❌ Admin setup error:", error.message);
    }

    if (!adminToken) {
      console.log("❌ Could not get admin token, trying direct approach...");

      // Try to assign role directly via database or create a simpler approach
      console.log(
        "\n2. Testing messaging endpoints without role requirements..."
      );

      // Login with test user
      const testLoginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "test@example.com",
          password: "test123",
        }),
      });

      if (testLoginResponse.ok) {
        const testData = await testLoginResponse.json();
        const testToken = testData.data?.accessToken;

        console.log("✅ Test user login successful");

        // Test messaging endpoints
        console.log("\n3. Testing messaging endpoints...");

        try {
          const messagesResponse = await fetch(
            `${API_BASE_URL}/users/with-messages`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${testToken}`,
              },
            }
          );

          console.log("Messages response status:", messagesResponse.status);
          const messagesText = await messagesResponse.text();
          console.log("Messages response body:", messagesText);

          if (messagesResponse.ok) {
            const messagesData = JSON.parse(messagesText);
            console.log("✅ Users with messages:", messagesData);
          } else {
            console.log("❌ Users with messages failed");
          }
        } catch (error) {
          console.log("❌ Messages endpoint error:", error.message);
        }
      }

      return;
    }

    // Step 2: Get roles
    console.log("\n2. Getting available roles...");
    try {
      const rolesResponse = await fetch(`${API_BASE_URL}/roles`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminToken}`,
        },
      });

      console.log("Roles response status:", rolesResponse.status);
      const rolesText = await rolesResponse.text();
      console.log("Roles response body:", rolesText);

      if (rolesResponse.ok) {
        const rolesData = JSON.parse(rolesText);
        console.log("✅ Available roles:", rolesData);

        // Find attendee role
        const attendeeRole = rolesData.data?.find(
          (role) => role.code === "attendee" || role.name === "Attendee"
        );
        if (attendeeRole) {
          console.log("✅ Found attendee role:", attendeeRole);

          // Step 3: Assign role to test user
          console.log("\n3. Assigning attendee role to test user...");
          try {
            const assignResponse = await fetch(
              `${API_BASE_URL}/users/81/roles`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                  roleId: attendeeRole.id,
                }),
              }
            );

            console.log("Assign role response status:", assignResponse.status);
            const assignText = await assignResponse.text();
            console.log("Assign role response body:", assignText);

            if (assignResponse.ok) {
              console.log("✅ Role assigned successfully");

              // Step 4: Test messaging endpoints again
              console.log(
                "\n4. Testing messaging endpoints after role assignment..."
              );

              const testLoginResponse = await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    email: "test@example.com",
                    password: "test123",
                  }),
                }
              );

              if (testLoginResponse.ok) {
                const testData = await testLoginResponse.json();
                const testToken = testData.data?.accessToken;

                const messagesResponse = await fetch(
                  `${API_BASE_URL}/users/with-messages`,
                  {
                    method: "GET",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${testToken}`,
                    },
                  }
                );

                console.log(
                  "Messages response status:",
                  messagesResponse.status
                );
                const messagesText = await messagesResponse.text();
                console.log("Messages response body:", messagesText);

                if (messagesResponse.ok) {
                  const messagesData = JSON.parse(messagesText);
                  console.log("✅ Users with messages:", messagesData);
                } else {
                  console.log("❌ Users with messages still failed");
                }
              }
            } else {
              console.log("❌ Role assignment failed");
            }
          } catch (error) {
            console.log("❌ Role assignment error:", error.message);
          }
        } else {
          console.log("❌ Attendee role not found");
        }
      } else {
        console.log("❌ Could not get roles");
      }
    } catch (error) {
      console.log("❌ Roles error:", error.message);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
assignRoleToUser();
