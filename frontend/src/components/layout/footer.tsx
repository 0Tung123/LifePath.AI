export function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} My App. All rights reserved.
          </p>
          <div className="mt-2 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Điều khoản sử dụng
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Chính sách bảo mật
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}