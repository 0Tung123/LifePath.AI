import React, { useEffect, useRef } from 'react';

interface StoryNodeProps {
  content: string;
  onNpcClick: (npcName: string) => void;
}

const StoryNode: React.FC<StoryNodeProps> = ({ content, onNpcClick }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Xử lý định dạng nội dung để làm nổi bật các phần khác nhau
  const formatContent = () => {
    if (!content) return '';

    let formattedContent = content;

    // Tìm và định dạng các đoạn hội thoại (định dạng: "Tên nhân vật: 'Lời nói'")
    const dialogueRegex = /([A-Za-z\sÀ-ỹ]+)(\s*:\s*["'])(.*?)(["'])/g;
    formattedContent = formattedContent.replace(dialogueRegex, (match, name, separator, speech, endQuote) => {
      const cleanName = name.trim();
      // Tạo một chuỗi HTML với tên nhân vật được bọc trong span có thuộc tính data-npc
      return `<span class="text-blue-400 cursor-pointer" data-npc="${cleanName}">${cleanName}</span>${separator}<span class="text-green-300">${speech}</span>${endQuote}`;
    });

    // Tìm và định dạng các tên vật phẩm hoặc kinh nghiệm (định dạng: [Tên vật phẩm] hoặc [+10 XP])
    const itemRegex = /\[([^\]]+)\]/g;
    formattedContent = formattedContent.replace(itemRegex, (match, item) => {
      if (item.includes('XP') || item.includes('kinh nghiệm')) {
        return `<span class="text-green-400">[${item}]</span>`;
      } else {
        return `<span class="text-yellow-400">[${item}]</span>`;
      }
    });

    // Xử lý xuống dòng
    formattedContent = formattedContent.replace(/\n/g, '<br />');

    return formattedContent;
  };

  // Thêm event listener cho các phần tử NPC sau khi nội dung được render
  useEffect(() => {
    if (contentRef.current) {
      const npcElements = contentRef.current.querySelectorAll('[data-npc]');
      npcElements.forEach(element => {
        element.addEventListener('click', () => {
          const npcName = element.getAttribute('data-npc');
          if (npcName) {
            onNpcClick(npcName);
          }
        });
      });

      // Cleanup function
      return () => {
        npcElements.forEach(element => {
          const npcName = element.getAttribute('data-npc');
          if (npcName) {
            element.removeEventListener('click', () => onNpcClick(npcName));
          }
        });
      };
    }
  }, [content, onNpcClick]);

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">Diễn biến câu chuyện</h3>
      <div 
        ref={contentRef}
        className="prose prose-invert max-w-none leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatContent() }}
      />
      <div className="mt-4 text-xs text-gray-500">
        <p>* Nhấp vào tên nhân vật để xem thêm thông tin</p>
      </div>
    </div>
  );
};

export default StoryNode;