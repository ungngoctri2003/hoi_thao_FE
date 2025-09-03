import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['email', 'name', 'password', 'phone', 'company', 'position']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            message: `Thiếu thông tin bắt buộc: ${field}` 
          },
          { status: 400 }
        )
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email không hợp lệ' 
        },
        { status: 400 }
      )
    }

    // Validate password strength
    if (body.password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải có ít nhất 6 ký tự' 
        },
        { status: 400 }
      )
    }

    // Prepare data for backend API
    const registrationData = {
      email: body.email,
      name: body.name,
      password: body.password,
      phone: body.phone,
      company: body.company,
      position: body.position,
      avatarUrl: body.avatarUrl || '',
      dietary: body.dietary || 'none',
      specialNeeds: body.specialNeeds || '',
      dateOfBirth: body.dateOfBirth || '',
      gender: body.gender || '',
      conferenceId: body.conferenceId || null,
    }

    // Call backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
    const response = await fetch(`${backendUrl}/registrations/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })

    const result = await response.json()

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = result.message || 'Đăng ký thất bại'
      
      if (response.status === 409) {
        errorMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.'
      } else if (response.status === 400) {
        errorMessage = 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.'
      } else if (response.status === 422) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.'
      }

      return NextResponse.json(
        { 
          success: false, 
          message: errorMessage 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      data: result.data
    })

  } catch (error: any) {
    console.error('Attendee registration error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi máy chủ. Vui lòng thử lại sau.' 
      },
      { status: 500 }
    )
  }
}
