"use client"

import { useAuth } from '@/hooks/use-auth';
import { AuthDebugPanel } from '@/components/auth/auth-debug-panel';
import { GoogleAuthTest } from '@/components/auth/google-auth-test';
import { SimpleGoogleTest } from '@/components/auth/simple-google-test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { User, Mail, Lock, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function TestAuthPage() {
  const { user, isAuthenticated, isLoading, login, register, logout, clearAuthState } = useAuth();
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ email: '', name: '', password: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ email và mật khẩu",
        variant: "destructive",
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      await login(loginForm.email, loginForm.password);
      toast({
        title: "Đăng nhập thành công",
        description: "Chào mừng bạn quay trở lại!",
        variant: "success",
      });
      setLoginForm({ email: '', password: '' });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.email || !registerForm.name || !registerForm.password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    setIsRegistering(true);
    try {
      await register(registerForm.email, registerForm.name, registerForm.password);
      setRegisterForm({ email: '', name: '', password: '' });
    } catch (error) {
      console.error('Register error:', error);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleClearAuth = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả dữ liệu xác thực?')) {
      clearAuthState();
      toast({
        title: "Đã xóa dữ liệu xác thực",
        description: "Trạng thái đăng nhập đã được reset",
        variant: "success",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Authentication</h1>
          <p className="text-gray-600">Trang test để kiểm tra trạng thái xác thực</p>
        </div>

        {/* Emergency Control */}
        <SimpleGoogleTest />

        {/* Auth Debug Panel */}
        <AuthDebugPanel />

        {/* Google Auth Test */}
        <GoogleAuthTest />

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Auth State */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Trạng thái hiện tại
              </CardTitle>
              <CardDescription>
                Thông tin về trạng thái xác thực hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="font-medium">Trạng thái:</span>
                <Badge variant={isAuthenticated ? "default" : "secondary"}>
                  {isLoading ? "Đang tải..." : isAuthenticated ? "Đã đăng nhập" : "Chưa đăng nhập"}
                </Badge>
              </div>

              {user && (
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                  <div><strong>ID:</strong> {user.id}</div>
                  <div><strong>Email:</strong> {user.email}</div>
                  <div><strong>Tên:</strong> {user.name}</div>
                  <div><strong>Role:</strong> {user.role}</div>
                  {user.avatar && <div><strong>Avatar:</strong> {user.avatar}</div>}
                </div>
              )}

              {isAuthenticated && (
                <Button onClick={handleLogout} variant="destructive" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" />
                  Đăng xuất
                </Button>
              )}

              <Button onClick={handleClearAuth} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Clear Auth State
              </Button>
            </CardContent>
          </Card>

          {/* Login Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                Đăng nhập
              </CardTitle>
              <CardDescription>
                Đăng nhập với tài khoản hiện có
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    value={loginForm.email}
                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                    placeholder="admin@conference.vn"
                    disabled={isLoggingIn}
                  />
                </div>
                <div>
                  <Label htmlFor="login-password">Mật khẩu</Label>
                  <Input
                    id="login-password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    placeholder="admin123"
                    disabled={isLoggingIn}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
                  <LogIn className="h-4 w-4 mr-2" />
                  {isLoggingIn ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Register Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Đăng ký
              </CardTitle>
              <CardDescription>
                Tạo tài khoản mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Tên</Label>
                  <Input
                    id="register-name"
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    disabled={isRegistering}
                  />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="user@example.com"
                    disabled={isRegistering}
                  />
                </div>
                <div>
                  <Label htmlFor="register-password">Mật khẩu</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    placeholder="Mật khẩu mạnh"
                    disabled={isRegistering}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isRegistering}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isRegistering ? "Đang đăng ký..." : "Đăng ký"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Các hành động nhanh để test
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => setLoginForm({ email: 'admin@conference.vn', password: 'admin123' })}
                variant="outline"
                className="w-full"
              >
                Fill Admin Credentials
              </Button>
              <Button
                onClick={() => setRegisterForm({ 
                  email: `test${Date.now()}@example.com`, 
                  name: 'Test User', 
                  password: 'test123' 
                })}
                variant="outline"
                className="w-full"
              >
                Fill Test Register Data
              </Button>
              <Button
                onClick={() => window.location.href = '/login'}
                variant="outline"
                className="w-full"
              >
                Go to Login Page
              </Button>
              <Button
                onClick={() => window.location.href = '/register'}
                variant="outline"
                className="w-full"
              >
                Go to Register Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
