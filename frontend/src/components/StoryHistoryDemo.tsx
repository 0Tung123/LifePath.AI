'use client';

import React from 'react';
import StoryHistoryPanel from './GameplayScreen/StoryHistoryPanel';
import { StoryHistoryItem, KnowledgeBaseItem } from '@/services/game.service';

const StoryHistoryDemo: React.FC = () => {
  // Sample data for testing
  const sampleStoryHistory: StoryHistoryItem[] = [
    {
      type: 'story',
      content: `Bạn đang đứng trước cổng của Thiên Kiếm Tông, một trong những môn phái lớn nhất trong Cửu Châu Đại Lục.

Trưởng lão Lý Thiên Minh: "Tiểu hữu, ngươi có muốn gia nhập môn phái của ta không?"

*Tôi cảm thấy một luồng khí mạnh mẽ từ ông ta phát ra, có lẽ ông ta là một cao thủ.*

Bạn nhận được Thiên Kiếm Quyết - một bí kíp kiếm thuật hiếm có.`,
      timestamp: new Date().toISOString(),
    },
    {
      type: 'story',
      content: `Sư phụ Trần Vô Cực: "Hôm nay ta sẽ dạy ngươi chiêu đầu tiên."

"Chiêu này gọi là Thiên Kiếm Phá Không, cần tập trung toàn bộ nội lực."

*Tôi chăm chú lắng nghe từng lời dạy của sư phụ.*`,
      timestamp: new Date().toISOString(),
    },
    {
      type: 'user_choice',
      content: `Tôi chọn gia nhập Thiên Kiếm Tông và học hỏi kiếm thuật từ Lý Thiên Minh.`,
      timestamp: new Date().toISOString(),
    },
    {
      type: 'system',
      content: `✨ [Hệ Thống]: Bạn nhận được 100 điểm kinh nghiệm!
📊 [Hệ Thống]: Kỹ năng Kiếm Thuật tăng lên cấp 2
🎯 [Mục Tiêu Mới]: Hoàn thành nhiệm vụ đầu tiên của môn phái`,
      timestamp: new Date().toISOString(),
    },
    {
      type: 'story',
      content: `Đồng môn Lý Hạo Nhiên: "Sư huynh, ngươi học nhanh thật đấy!"

Đồng môn Vương Tiểu Minh: "Đúng vậy, tôi học mãi mà vẫn chưa thành thạo."

Trưởng lão Lý Thiên Minh: "Các ngươi đều rất chăm chỉ, hãy tiếp tục cố gắng."

Hệ thống: "Bạn đã hoàn thành bài học đầu tiên!"`,
      timestamp: new Date().toISOString(),
    },
  ];

  const sampleKnowledgeBase: KnowledgeBaseItem[] = [
    {
      type: 'location',
      name: 'Thiên Kiếm Tông',
      description:
        'Một môn phái kiếm thuật nổi tiếng với truyền thống lâu đời và nhiều cao thủ.',
    },
    {
      type: 'npc',
      name: 'Lý Thiên Minh',
      description:
        'Trưởng lão của Thiên Kiếm Tông, tu vi sâu dày, tính cách nghiêm khắc nhưng tốt bụng.',
    },
    {
      type: 'npc',
      name: 'Trần Vô Cực',
      description:
        'Sư phụ dạy kiếm thuật, nổi tiếng với chiêu thức Thiên Kiếm Phá Không.',
    },
    {
      type: 'location',
      name: 'Cửu Châu Đại Lục',
      description:
        'Lục địa rộng lớn nơi các môn phái tu tiên sinh sống và tranh đấu.',
    },
    {
      type: 'item',
      name: 'Thiên Kiếm Quyết',
      description:
        'Bí kíp kiếm thuật cấp cao của Thiên Kiếm Tông, chứa đựng những chiêu thức tinh diệu.',
    },
    {
      type: 'item',
      name: 'Kiếm Thuật',
      description:
        'Kỹ năng sử dụng kiếm, một trong những võ công cơ bản nhất của tu tiên giả.',
    },
    {
      type: 'item',
      name: 'Thiên Kiếm Phá Không',
      description: 'Chiêu thức kiếm thuật mạnh mẽ, có thể phá vỡ không gian.',
    },
    {
      type: 'npc',
      name: 'Lý Hạo Nhiên',
      description:
        'Đồng môn trong Thiên Kiếm Tông, tính cách thân thiện và hòa đồng.',
    },
    {
      type: 'npc',
      name: 'Vương Tiểu Minh',
      description:
        'Đồng môn khác trong Thiên Kiếm Tông, chăm chỉ nhưng tiến bộ chậm.',
    },
  ];

  const handleLoreClick = (item: KnowledgeBaseItem) => {
    alert(`${item.name}: ${item.description}`);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Demo: Thiết Kế Mới - Lời Thoại & Tên Riêng
        </h1>

        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-amber-400 mb-4">
            Thay đổi thiết kế:
          </h2>
          <ul className="text-gray-300 space-y-2">
            <li>
              • <span className="text-blue-400 font-bold">Lời thoại</span>: Tên
              người nói có màu sắc riêng biệt, in đậm, xuống dòng riêng
            </li>
            <li>
              • <span className="text-teal-400 font-medium">Tên riêng</span>:
              NPC, vật phẩm, địa danh màu xanh ngọc, có thể click
            </li>
            <li>
              •{' '}
              <span className="text-purple-400 font-medium">
                Màu sắc nhân vật
              </span>
              : Mỗi nhân vật có màu riêng để dễ phân biệt
            </li>
          </ul>
        </div>

        <div className="h-96">
          <StoryHistoryPanel
            storyHistory={sampleStoryHistory}
            knowledgeBase={sampleKnowledgeBase}
            onLoreClick={handleLoreClick}
            isLoading={false}
          />
        </div>
      </div>
    </div>
  );
};

export default StoryHistoryDemo;
