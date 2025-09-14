// Using fetch from browser or node 18+

const API_BASE = "http://localhost:3001/api";

// Test data for creating multiple sessions
const testSessions = [
  {
    title: "Phiên 1 - Công nghệ AI",
    description: "Thảo luận về trí tuệ nhân tạo trong doanh nghiệp",
    speaker: "Nguyễn Văn A",
    speakerEmail: "nguyenvana@example.com",
    startTime: "2024-12-20T09:00:00.000Z",
    endTime: "2024-12-20T10:30:00.000Z",
    room: "Phòng A101",
    track: "AI/ML",
    capacity: 50,
    tags: ["AI", "Machine Learning", "Business"],
  },
  {
    title: "Phiên 2 - Blockchain",
    description: "Ứng dụng blockchain trong tài chính",
    speaker: "Trần Thị B",
    speakerEmail: "tranthib@example.com",
    startTime: "2024-12-20T11:00:00.000Z",
    endTime: "2024-12-20T12:30:00.000Z",
    room: "Phòng A102",
    track: "Blockchain",
    capacity: 40,
    tags: ["Blockchain", "Finance", "Cryptocurrency"],
  },
  {
    title: "Phiên 3 - Cloud Computing",
    description: "Dịch vụ đám mây và microservices",
    speaker: "Lê Văn C",
    speakerEmail: "levanc@example.com",
    startTime: "2024-12-20T14:00:00.000Z",
    endTime: "2024-12-20T15:30:00.000Z",
    room: "Phòng A103",
    track: "Cloud",
    capacity: 60,
    tags: ["Cloud", "Microservices", "DevOps"],
  },
  {
    title: "Phiên 4 - Mobile Development",
    description: "Phát triển ứng dụng di động cross-platform",
    speaker: "Phạm Thị D",
    speakerEmail: "phamthid@example.com",
    startTime: "2024-12-21T09:00:00.000Z",
    endTime: "2024-12-21T10:30:00.000Z",
    room: "Phòng B101",
    track: "Mobile",
    capacity: 45,
    tags: ["Mobile", "React Native", "Flutter"],
  },
  {
    title: "Phiên 5 - Data Science",
    description: "Phân tích dữ liệu lớn và machine learning",
    speaker: "Hoàng Văn E",
    speakerEmail: "hoangvane@example.com",
    startTime: "2024-12-21T11:00:00.000Z",
    endTime: "2024-12-21T12:30:00.000Z",
    room: "Phòng B102",
    track: "Data Science",
    capacity: 55,
    tags: ["Data Science", "Big Data", "Analytics"],
  },
  {
    title: "Phiên 6 - Web Development",
    description: "Xu hướng phát triển web hiện đại",
    speaker: "Vũ Thị F",
    speakerEmail: "vuthif@example.com",
    startTime: "2024-12-21T14:00:00.000Z",
    endTime: "2024-12-21T15:30:00.000Z",
    room: "Phòng B103",
    track: "Web",
    capacity: 50,
    tags: ["Web", "React", "Vue.js"],
  },
  {
    title: "Phiên 7 - Cybersecurity",
    description: "Bảo mật thông tin và an ninh mạng",
    speaker: "Đặng Văn G",
    speakerEmail: "dangvang@example.com",
    startTime: "2024-12-22T09:00:00.000Z",
    endTime: "2024-12-22T10:30:00.000Z",
    room: "Phòng C101",
    track: "Security",
    capacity: 35,
    tags: ["Security", "Cybersecurity", "Privacy"],
  },
  {
    title: "Phiên 8 - IoT",
    description: "Internet of Things và smart cities",
    speaker: "Bùi Thị H",
    speakerEmail: "buithih@example.com",
    startTime: "2024-12-22T11:00:00.000Z",
    endTime: "2024-12-22T12:30:00.000Z",
    room: "Phòng C102",
    track: "IoT",
    capacity: 40,
    tags: ["IoT", "Smart Cities", "Sensors"],
  },
  {
    title: "Phiên 9 - DevOps",
    description: "DevOps và CI/CD pipeline",
    speaker: "Ngô Văn I",
    speakerEmail: "ngovani@example.com",
    startTime: "2024-12-22T14:00:00.000Z",
    endTime: "2024-12-22T15:30:00.000Z",
    room: "Phòng C103",
    track: "DevOps",
    capacity: 45,
    tags: ["DevOps", "CI/CD", "Automation"],
  },
  {
    title: "Phiên 10 - UI/UX Design",
    description: "Thiết kế giao diện người dùng hiện đại",
    speaker: "Lý Thị K",
    speakerEmail: "lythik@example.com",
    startTime: "2024-12-23T09:00:00.000Z",
    endTime: "2024-12-23T10:30:00.000Z",
    room: "Phòng D101",
    track: "Design",
    capacity: 30,
    tags: ["UI/UX", "Design", "User Experience"],
  },
  {
    title: "Phiên 11 - Database",
    description: "Quản lý cơ sở dữ liệu hiện đại",
    speaker: "Đinh Văn L",
    speakerEmail: "dinhvanl@example.com",
    startTime: "2024-12-23T11:00:00.000Z",
    endTime: "2024-12-23T12:30:00.000Z",
    room: "Phòng D102",
    track: "Database",
    capacity: 50,
    tags: ["Database", "SQL", "NoSQL"],
  },
  {
    title: "Phiên 12 - Testing",
    description: "Kiểm thử phần mềm tự động",
    speaker: "Võ Thị M",
    speakerEmail: "vothim@example.com",
    startTime: "2024-12-23T14:00:00.000Z",
    endTime: "2024-12-23T15:30:00.000Z",
    room: "Phòng D103",
    track: "Testing",
    capacity: 40,
    tags: ["Testing", "Automation", "QA"],
  },
];

async function createTestSessions() {
  try {
    console.log("🚀 Bắt đầu tạo phiên test...");

    // First, get conferences to get a conference ID
    const conferencesResponse = await fetch(`${API_BASE}/conferences`);
    const conferences = await conferencesResponse.json();

    if (!conferences.data || conferences.data.length === 0) {
      console.log(
        "❌ Không tìm thấy hội nghị nào. Vui lòng tạo hội nghị trước."
      );
      return;
    }

    const conferenceId = conferences.data[0].id;
    console.log(
      `📋 Sử dụng hội nghị: ${conferences.data[0].name} (ID: ${conferenceId})`
    );

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < testSessions.length; i++) {
      const session = testSessions[i];
      try {
        const response = await fetch(`${API_BASE}/sessions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conferenceId: conferenceId,
            ...session,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Tạo phiên ${i + 1}: ${session.title}`);
          successCount++;
        } else {
          const error = await response.text();
          console.log(`❌ Lỗi tạo phiên ${i + 1}: ${error}`);
          errorCount++;
        }
      } catch (error) {
        console.log(`❌ Lỗi tạo phiên ${i + 1}: ${error.message}`);
        errorCount++;
      }

      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`✅ Thành công: ${successCount} phiên`);
    console.log(`❌ Lỗi: ${errorCount} phiên`);
    console.log(`📝 Tổng cộng: ${testSessions.length} phiên`);

    if (successCount > 0) {
      console.log(
        "\n🎉 Hoàn thành! Bây giờ bạn có thể kiểm tra phân trang tại:"
      );
      console.log("http://localhost:3000/sessions-management");
    }
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
  }
}

// Run the script
createTestSessions();
