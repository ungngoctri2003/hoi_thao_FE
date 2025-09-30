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

    // Validate date of birth if provided
    if (body.dateOfBirth) {
      const dateOfBirth = new Date(body.dateOfBirth)
      const currentYear = new Date().getFullYear()
      
      // Check if date is valid
      if (isNaN(dateOfBirth.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Ngày sinh không hợp lệ' 
          },
          { status: 400 }
        )
      }
      
      // Check if year is reasonable (not in the future and not too far in the past)
      const birthYear = dateOfBirth.getFullYear()
      if (birthYear > currentYear || birthYear < 1900) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Năm sinh phải hợp lệ (từ 1900 đến hiện tại)' 
          },
          { status: 400 }
        )
      }
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
    console.log('Calling backend API:', `${backendUrl}/registrations/public`)
    console.log('Registration data:', JSON.stringify(registrationData, null, 2))
    
    const response = await fetch(`${backendUrl}/registrations/public`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })

    const result = await response.json()
    console.log('Backend response status:', response.status)
    console.log('Backend response:', JSON.stringify(result, null, 2))

    if (!response.ok) {
      // Handle specific error cases
      let errorMessage = result.message || 'Đăng ký thất bại'
      
      if (response.status === 409) {
        errorMessage = 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc sử dụng email khác.'
      } else if (response.status === 400) {
        errorMessage = result.error?.message || 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.'
      } else if (response.status === 422) {
        errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại các trường thông tin.'
      }

      console.error('Registration failed:', errorMessage)
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
