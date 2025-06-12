'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ProfileForm } from '@/components/profile/profile-form';
import { AIContainer } from '@/components/ui/ai-container';
import { AIText } from '@/components/ui/ai-text';
import { AICard } from '@/components/ui/ai-card';
import { AIInput } from '@/components/ui/ai-input';
import { AIButton } from '@/components/ui/ai-button';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          </div>
          <AIText variant="typing" className="text-lg text-primary">
            Đang tải dữ liệu người dùng...
          </AIText>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {/* Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(var(--primary),0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(var(--primary),0.03)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
        
        {/* Glowing orb */}
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] opacity-30 animate-pulse"></div>
        
        {/* Digital circuit lines */}
        <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="circuit-pattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
              <path d="M10 10 H 90 V 90 H 170 V 170 H 90 V 90 H 10 V 10" stroke="rgb(var(--primary))" strokeWidth="1" fill="none" />
              <circle cx="10" cy="10" r="3" fill="rgb(var(--primary))" />
              <circle cx="90" cy="90" r="3" fill="rgb(var(--primary))" />
              <circle cx="170" cy="170" r="3" fill="rgb(var(--primary))" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#circuit-pattern)" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left sidebar */}
          <div className="md:w-1/4">
            <AIContainer variant="glass" className="sticky top-24">
              <div className="flex flex-col items-center mb-6 pb-6 border-b border-[rgb(var(--border))]">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 neon-border">
                  {user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-20 h-20 rounded-full"
                    />
                  ) : (
                    <span className="text-3xl font-medium text-primary">
                      {user?.firstName?.[0] || ''}
                      {user?.lastName?.[0] || ''}
                    </span>
                  )}
                </div>
                <AIText variant="gradient" as="h2" className="text-xl font-bold">
                 {`${user?.firstName || ""} ${user?.lastName || ""}`}
                </AIText>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                
                <div className="mt-4 w-full">
                  <div className="text-xs text-muted-foreground mb-1 flex justify-between">
                    <span>AI LEVEL</span>
                    <span>LVL 3</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-accent w-[35%]"></div>
                  </div>
                </div>
              </div>
              
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    activeTab === 'profile' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-primary/5'
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Thông tin cá nhân
                </button>
                
                <button 
                  onClick={() => setActiveTab('preferences')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    activeTab === 'preferences' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-primary/5'
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Tùy chọn AI
                </button>
                
                <button 
                  onClick={() => setActiveTab('security')}
                  className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                    activeTab === 'security' 
                      ? 'bg-primary/10 text-primary' 
                      : 'text-foreground hover:bg-primary/5'
                  }`}
                >
                  <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Bảo mật
                </button>
              </nav>
              
              <div className="mt-6 pt-6 border-t border-[rgb(var(--border))]">
                <div className="text-xs text-muted-foreground mb-2">THÔNG TIN HỆ THỐNG</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>AI Narrative Engine</span>
                    <span className="text-primary">v2.4.7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Neural Network</span>
                    <span className="text-primary">ACTIVE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>User ID</span>
                    <span className="text-primary">{user?.id.substring(0, 8)}</span>
                  </div>
                </div>
              </div>
            </AIContainer>
          </div>

          {/* Main content */}
          <div className="md:w-3/4">
            <AIContainer variant="glass">
              {activeTab === 'profile' && (
                <ProfileForm />
              )}
              
              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <AIText variant="gradient" as="h3" className="text-xl font-bold">
                      Tùy chọn AI
                    </AIText>
                    <p className="text-sm text-muted-foreground mt-1">
                      Điều chỉnh cách AI tương tác với bạn trong các cốt truyện
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AICard variant="hover" glowing className="p-4">
                      <h4 className="text-sm font-medium mb-2">Phong cách viết</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="radio" id="style-descriptive" name="writing-style" className="mr-2" defaultChecked />
                          <label htmlFor="style-descriptive" className="text-sm">Mô tả chi tiết</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="style-concise" name="writing-style" className="mr-2" />
                          <label htmlFor="style-concise" className="text-sm">Ngắn gọn, súc tích</label>
                        </div>
                        <div className="flex items-center">
                          <input type="radio" id="style-poetic" name="writing-style" className="mr-2" />
                          <label htmlFor="style-poetic" className="text-sm">Thơ mộng, trữ tình</label>
                        </div>
                      </div>
                    </AICard>
                    
                    <AICard variant="hover" glowing className="p-4">
                      <h4 className="text-sm font-medium mb-2">Thể loại ưa thích</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-scifi" className="mr-2" defaultChecked />
                          <label htmlFor="genre-scifi" className="text-sm">Khoa học viễn tưởng</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-fantasy" className="mr-2" defaultChecked />
                          <label htmlFor="genre-fantasy" className="text-sm">Kỳ ảo</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="genre-mystery" className="mr-2" />
                          <label htmlFor="genre-mystery" className="text-sm">Trinh thám</label>
                        </div>
                      </div>
                    </AICard>
                    
                    <AICard variant="hover" glowing className="p-4">
                      <h4 className="text-sm font-medium mb-2">Độ phức tạp của cốt truyện</h4>
                      <div className="space-y-4">
                        <input 
                          type="range" 
                          min="1" 
                          max="5" 
                          defaultValue="3"
                          className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Đơn giản</span>
                          <span>Trung bình</span>
                          <span>Phức tạp</span>
                        </div>
                      </div>
                    </AICard>
                    
                    <AICard variant="hover" glowing className="p-4">
                      <h4 className="text-sm font-medium mb-2">Tính cách nhân vật AI</h4>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <input type="checkbox" id="char-friendly" className="mr-2" defaultChecked />
                          <label htmlFor="char-friendly" className="text-sm">Thân thiện</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="char-mysterious" className="mr-2" defaultChecked />
                          <label htmlFor="char-mysterious" className="text-sm">Bí ẩn</label>
                        </div>
                        <div className="flex items-center">
                          <input type="checkbox" id="char-challenging" className="mr-2" />
                          <label htmlFor="char-challenging" className="text-sm">Thách thức</label>
                        </div>
                      </div>
                    </AICard>
                  </div>
                </div>
              )}
              
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div>
                    <AIText variant="gradient" as="h3" className="text-xl font-bold">
                      Bảo mật
                    </AIText>
                    <p className="text-sm text-muted-foreground mt-1">
                      Quản lý các cài đặt bảo mật cho tài khoản của bạn
                    </p>
                  </div>
                  
                  <AICard variant="hover" glowing className="p-4">
                    <h4 className="text-sm font-medium mb-4">Đổi mật khẩu</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-foreground/80 block mb-1">Mật khẩu hiện tại</label>
                        <AIInput variant="neon" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/80 block mb-1">Mật khẩu mới</label>
                        <AIInput variant="neon" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <label className="text-sm text-foreground/80 block mb-1">Xác nhận mật khẩu mới</label>
                        <AIInput variant="neon" type="password" placeholder="••••••••" />
                      </div>
                      <div>
                        <AIButton variant="gradient" size="sm">
                          Cập nhật mật khẩu
                        </AIButton>
                      </div>
                    </div>
                  </AICard>
                  
                  <AICard variant="hover" glowing className="p-4">
                    <h4 className="text-sm font-medium mb-4">Phiên đăng nhập</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-[rgb(var(--border))]">
                        <div>
                          <div className="text-sm">Windows - Chrome</div>
                          <div className="text-xs text-muted-foreground">Hiện tại</div>
                        </div>
                        <div className="text-xs text-green-500">Hoạt động</div>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-[rgb(var(--border))]">
                        <div>
                          <div className="text-sm">Android - Mobile App</div>
                          <div className="text-xs text-muted-foreground">Cách đây 2 giờ</div>
                        </div>
                        <div className="text-xs text-muted-foreground">Không hoạt động</div>
                      </div>
                      <div>
                        <AIButton variant="outline" size="sm">
                          Đăng xuất khỏi tất cả các thiết bị khác
                        </AIButton>
                      </div>
                    </div>
                  </AICard>
                  
                  <AICard variant="hover" glowing className="p-4">
                    <h4 className="text-sm font-medium mb-4">Quyền riêng tư dữ liệu</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm">Lưu lịch sử tương tác</div>
                          <div className="text-xs text-muted-foreground">Cho phép AI học từ các tương tác trước đây</div>
                        </div>
                        <div className="relative inline-block w-10 h-5 rounded-full bg-muted">
                          <input type="checkbox" id="toggle-history" className="sr-only" defaultChecked />
                          <span className="block w-5 h-5 rounded-full bg-primary absolute left-0 transition-transform duration-200 transform translate-x-5"></span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm">Chia sẻ dữ liệu ẩn danh</div>
                          <div className="text-xs text-muted-foreground">Giúp cải thiện hệ thống AI</div>
                        </div>
                        <div className="relative inline-block w-10 h-5 rounded-full bg-muted">
                          <input type="checkbox" id="toggle-share" className="sr-only" defaultChecked />
                          <span className="block w-5 h-5 rounded-full bg-primary absolute left-0 transition-transform duration-200 transform translate-x-5"></span>
                        </div>
                      </div>
                    </div>
                  </AICard>
                </div>
              )}
            </AIContainer>
          </div>
        </div>
      </div>
    </div>
  );
}