import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firebaseUid, email, name, avatar } = body;

    console.log('Google register request:', { firebaseUid, email, name, avatar });

    // Validate required fields
    if (!firebaseUid || !email || !name) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields: firebaseUid, email, and name' },
        { status: 400 }
      );
    }

    // Gọi backend thực để xử lý Google registration
    try {
      const backendResponse = await fetch(`${API_BASE_URL}/auth/google/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firebaseUid, email, name, avatar }),
      });

      const backendResult = await backendResponse.json();

      if (backendResponse.ok) {
        console.log('Google registration successful via backend');
        return NextResponse.json(backendResult);
      } else {
        console.error('Backend registration failed:', backendResult);
        return NextResponse.json(
          { success: false, message: backendResult.message || 'Registration failed' },
          { status: backendResponse.status }
        );
      }
    } catch (backendError) {
      console.error('Backend error:', backendError);
      return NextResponse.json(
        { success: false, message: 'Backend service unavailable' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Google register error:', error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 400 }
    );
  }
}
