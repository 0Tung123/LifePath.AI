"use client";

import React, { useState } from "react";

interface BackstoryGuideProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export default function BackstoryGuide({ value, onChange }: BackstoryGuideProps) {
  const [showTips, setShowTips] = useState<boolean>(false);

  const examples = [
    {
      title: "🔥 Hệ thống OP",
      content: "Sở hữu hệ thống 'God Mode' bất khả chiến bại. Kích hoạt sau tai nạn bí ẩn. Hiện sống ẩn danh như học sinh. Muốn tìm hiểu nguồn gốc sức mạnh."
    },
    {
      title: "⚔️ Võ hiệp",
      content: "Thừa kế tuyệt học 'Cửu Thiên Huyền Công' từ sư phụ bí ẩn. Hiện là đệ tử ngoại môn của Thiên Kiếm Phái. Mục tiêu trả thù cho sư phụ."
    },
    {
      title: "🌟 Hiện đại",
      content: "Cựu đặc nhiệm với khả năng dự đoán tương lai 3 giây. Gia đình bị tổ chức bí mật sát hại. Hiện làm bảo vệ. Quyết tâm trả thù."
    }
  ];

  return (
    <div className="col-span-1 md:col-span-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="characterBackstory"
          className="block text-sm font-medium text-gray-700"
        >
          Tiểu sử nhân vật
        </label>
        <button
          type="button"
          onClick={() => setShowTips(!showTips)}
          className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
        >
          💡 Mẹo viết tiểu sử OP
          <span className={`transform transition-transform ${showTips ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mb-1">
        Chỉ cần 3-5 câu về bản chất và sức mạnh đặc biệt. AI sẽ tự động mở rộng thành vũ trụ nhân vật hoàn chỉnh!
      </p>
      
      {showTips && (
        <div className="mb-3 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            🚀 Template cho nhân vật không giới hạn
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <div className="text-xs">
                <span className="font-semibold text-purple-700">Bản chất:</span>
                <span className="text-gray-600 ml-1">Sở hữu hệ thống [tên] cho phép [khả năng]</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-purple-700">Nguồn gốc:</span>
                <span className="text-gray-600 ml-1">Được [cách thức có được sức mạnh]</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-purple-700">Hiện tại:</span>
                <span className="text-gray-600 ml-1">Đang sống như [danh tính che giấu]</span>
              </div>
              <div className="text-xs">
                <span className="font-semibold text-purple-700">Mục tiêu:</span>
                <span className="text-gray-600 ml-1">[Điều muốn đạt được]</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <h5 className="font-semibold text-green-700 text-xs">💎 Ví dụ mẫu:</h5>
              {examples.map((example, index) => (
                <div key={index} className="bg-white p-2 rounded border-l-4 border-green-400">
                  <div className="font-medium text-xs text-green-800 mb-1">{example.title}</div>
                  <div className="text-xs text-gray-700 italic">&ldquo;{example.content}&rdquo;</div>
                  <button
                    type="button"
                    onClick={() => onChange({ target: { name: 'characterBackstory', value: example.content } } as React.ChangeEvent<HTMLTextAreaElement>)}
                    className="text-xs text-blue-600 hover:text-blue-800 mt-1 underline"
                  >
                    Sử dụng mẫu này
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
            <h5 className="font-semibold text-yellow-800 text-xs mb-2">🎯 Bí quyết của top 0.1%:</h5>
            <ul className="text-xs text-yellow-700 space-y-1">
              <li>• <strong>Đừng viết quá chi tiết</strong> - AI sẽ mở rộng tự động</li>
              <li>• <strong>Tập trung vào điều độc đáo</strong> - Điều gì khiến nhân vật khác biệt?</li>
              <li>• <strong>Để lại bí ẩn</strong> - Đừng giải thích hết mọi thứ</li>
              <li>• <strong>Cân bằng OP và yếu điểm</strong> - Sức mạnh lớn = giá phải trả lớn</li>
            </ul>
          </div>
        </div>
      )}

      <textarea
        id="characterBackstory"
        name="characterBackstory"
        rows={5}
        required
        placeholder="VD: Sở hữu hệ thống 'Absolute Control' cho phép thống trị mọi thứ. Được kích hoạt sau tai nạn bí ẩn. Hiện đang sống như sinh viên bình thường. Mục tiêu tìm hiểu sự thật về sức mạnh này..."
        value={value}
        onChange={onChange}
        className="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 resize-none"
      />
    </div>
  );
}