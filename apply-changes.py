#!/usr/bin/env python3
"""
Script to apply check-in/check-out changes to page.tsx
Run: python apply-changes.py
"""

import re

file_path = "app/checkin-public/page.tsx"

def read_file():
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(content):
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def apply_changes():
    content = read_file()
    original_content = content
    changes_made = []
    
    # Change 1: Update first checkInAPI.checkInAttendee in handleQRScanSuccess
    pattern1 = r'(// Show QR info if available.*?setShowQRInfo\(true\);\s+}\s+)(// Perform check-in\s+const response = await checkInAPI\.checkInAttendee\(\{\s+attendeeId: validation\.attendee\.id,\s+qrCode: qrData,\s+conferenceId: conferenceId,\s+checkInMethod: "qr",\s+\}\);)'
    
    replacement1 = r'''\1// Perform check-in/checkout
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // Include session ID from QR code
        actionType: selectedActionType, // Include action type (checkin/checkout)
        checkInMethod: "qr",
      });'''
    
    if re.search(pattern1, content, re.DOTALL):
        content = re.sub(pattern1, replacement1, content, count=1, flags=re.DOTALL)
        changes_made.append("✓ Updated first checkInAPI call in handleQRScanSuccess")
    
    # Change 2: Update success message in handleQRScanSuccess
    pattern2 = r'(// Show popup success message\s+setPopupMessage\(\{\s+message: )`✅ Check-in thành công cho \$\{response\.data\.attendeeName\}`,'
    
    replacement2 = r'''\1`✅ ${selectedActionType === 'checkin' ? 'Check-in' : 'Check-out'} thành công cho ${response.data.attendeeName}${sessionId ? ` (Session ${sessionId})` : ''}`,'''
    
    if re.search(pattern2, content):
        content = re.sub(pattern2, replacement2, content, count=1)
        changes_made.append("✓ Updated first success message")
    
    # Change 3: Add sessionId extraction in handleQRUploadSuccess
    pattern3 = r'(let parsedQRData = null;\s+let conferenceId: number \| null = conferenceIdFromQR \|\| null;)\s+(try \{)'
    
    replacement3 = r'''\1
      let sessionId: number | null = null;

      \2'''
    
    if re.search(pattern3, content):
        content = re.sub(pattern3, replacement3, content, count=1)
        changes_made.append("✓ Added sessionId variable in handleQRUploadSuccess")
    
    # Change 4: Extract sessionId from QR data in handleQRUploadSuccess
    pattern4 = r'(// Extract conference ID from QR data.*?conferenceId = parsedQRData\.conf;\s+}\s+)(\} catch \(e\))'
    
    replacement4 = r'''\1
        // Extract session ID from QR data if available
        if (parsedQRData.session) {
          sessionId = parsedQRData.session;
          console.log("📱 Session ID from uploaded QR:", sessionId);
        }
      \2'''
    
    if re.search(pattern4, content, re.DOTALL):
        content = re.sub(pattern4, replacement4, content, count=1, flags=re.DOTALL)
        changes_made.append("✓ Added sessionId extraction in handleQRUploadSuccess")
    
    # Change 5: Update second checkInAPI.checkInAttendee in handleQRUploadSuccess
    # This one is trickier - we need to find the second occurrence
    pattern5 = r'(handleQRUploadSuccess.*?// Perform check-in\s+const response = await checkInAPI\.checkInAttendee\(\{\s+attendeeId: validation\.attendee\.id,\s+qrCode: qrData,\s+conferenceId: conferenceId,\s+checkInMethod: "qr",\s+\}\);)'
    
    replacement5 = r'''// Perform check-in/checkout
      const response = await checkInAPI.checkInAttendee({
        attendeeId: validation.attendee.id,
        qrCode: qrData,
        conferenceId: conferenceId,
        sessionId: sessionId, // Include session ID from QR code
        actionType: selectedActionType, // Include action type (checkin/checkout)
        checkInMethod: "qr",
      });'''
    
    # Find second occurrence
    matches = list(re.finditer(r'// Perform check-in\s+const response = await checkInAPI\.checkInAttendee\(\{[^}]+\}\);', content, re.DOTALL))
    if len(matches) >= 2:
        second_match = matches[1]
        before = content[:second_match.start()]
        after = content[second_match.end():]
        content = before + replacement5 + after
        changes_made.append("✓ Updated second checkInAPI call in handleQRUploadSuccess")
    
    # Change 6: Update second success message
    matches = list(re.finditer(r'// Show popup success message\s+setPopupMessage\(\{\s+message: `✅ Check-in thành công cho \$\{response\.data\.attendeeName\}`,', content))
    if len(matches) >= 2:
        second_match = matches[1]
        before = content[:second_match.start()]
        after = content[second_match.end():]
        new_msg = '''// Show popup success message with action type
        const actionText = selectedActionType === 'checkin' ? 'Check-in' : 'Check-out';
        const sessionInfo = sessionId ? ` (Session ${sessionId})` : '';
        setPopupMessage({
          message: `✅ ${actionText} thành công cho ${response.data.attendeeName}${sessionInfo}`,'''
        content = before + new_msg + after
        changes_made.append("✓ Updated second success message")
    
    # Save if changes were made
    if content != original_content:
        write_file(content)
        print("✅ Changes applied successfully!\n")
        for change in changes_made:
            print(f"  {change}")
        print(f"\n📝 Total changes: {len(changes_made)}")
        return True
    else:
        print("⚠️  No changes were made. File might already be updated.")
        return False

if __name__ == "__main__":
    print("🔧 Applying check-in/checkout changes to page.tsx...\n")
    try:
        apply_changes()
        print("\n✨ Done! Please check the file and test the application.")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("Please apply changes manually using APPLY-CHECKIN-CHECKOUT-FRONTEND.md")

