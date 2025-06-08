"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { StoryStyleSelector } from "@/components/game/StoryStyleSelector";
import Link from "next/link";

// Định nghĩa các interface
interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  attributes: Record<string, number>;
  skills: string[];
  inventory?: {
    items: Array<{
      id: string;
      name: string;
      description?: string;
      type?: string;
    }>;
  };
}

interface StorySegment {
  content: string;
  choices: string[];
}

export default function AIStoryPage() {
  const router = useRouter();
 
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [isProcessingChoice, setIsProcessingChoice] = useState(false);
  
  // Dữ liệu giả cho demo
  useEffect(() => {
    // Giả lập việc load dữ liệu nhân vật
    setTimeout(() => {
      const demoCharacter: Character = {
        id: "demo-character-id",
        name: "Lưu Tinh Thần",
        characterClass: "Kiếm Khách",
        level: 5,
        attributes: {
          strength: 8,
          agility: 12,
          intelligence: 7,
          constitution: 9,
          luck: 6
        },
        skills: ["Kiếm Pháp Cơ Bản", "Thân Pháp Nhẹ Nhàng", "Khí Công Tâm Pháp"],
        inventory: {
          items: [
            { id: "item-1", name: "Thanh Long Kiếm", type: "weapon" },
            { id: "item-2", name: "Thuốc Hồi Phục", type: "consumable" },
            { id: "item-3", name: "Bí Kíp Kiếm Thuật", type: "book" }
          ]
        }
      };
      
      // Đoạn truyện mở đầu
      const initialStory: StorySegment = {
        content: `[CẢNH]: Dãy núi Thanh Vân chìm trong sương mù dày đặc, cây cối rậm rạp tạo nên bóng tối âm u, thỉnh thoảng vọng lại tiếng chim muông kêu vang. Trời vừa tảng sáng, ánh mặt trời còn chưa xuyên qua được màn sương dày đặc.

[NHÂN VẬT]: Lưu Tinh Thần (màu xanh) nhẹ nhàng bước trên con đường mòn, thanh kiếm Thanh Long đeo sau lưng phản chiếu ánh sáng lạnh lẽo. Gã mặc bộ y phục màu xanh nhạt, thân hình dong dỏng cao, mái tóc đen buộc gọn sau gáy.

[TÂM CẢNH]: *Sư phụ nói Thanh Vân Trang nằm sâu trong dãy núi này. Ta phải tìm được nó trước khi trời tối. Chỉ có Trang chủ Thanh Vân mới có thể giải được độc trong người ta.*`,
        choices: [
          "Tiếp tục đi theo con đường mòn",
          "Dừng lại để xem xét dấu vết xung quanh",
          "Leo lên cao để tìm kiếm Thanh Vân Trang từ xa"
        ]
      };
      
      setCharacter(demoCharacter);
      setStoryHistory([initialStory]);
      setLoading(false);
    }, 1500);
  }, []);
  
  // Hàm xử lý khi người chơi chọn một lựa chọn
  const handleChoiceSelected = (choice: string) => {
    if (isProcessingChoice) return;
    
    setSelectedChoice(choice);
    setIsProcessingChoice(true);
    
    // Cuộn xuống để hiện lựa chọn đã chọn
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);
  };
  
  // Hàm xử lý khi nội dung mới được tạo ra
  const handleContentGenerated = (content: string, choices: string[]) => {
    setStoryHistory(prev => [
      ...prev,
      { content, choices }
    ]);
    
    setSelectedChoice(null);
    setIsProcessingChoice(false);
    
    // Cuộn xuống để hiện nội dung mới
    setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: "smooth"
        });
      }
    }, 100);
  };
  
  // Xử lý lỗi khi tạo nội dung
  const handleGenerationError = (errorMsg: string) => {
    setError(errorMsg);
    setIsProcessingChoice(false);
    setSelectedChoice(null);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải dữ liệu câu chuyện...
          </div>
          <div className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500 mb-4">Lỗi</div>
          <p>{error}</p>
          <Link
            href="/game"
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors inline-block"
          >
            Quay lại trang chủ
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => router.push("/game")}
              className="mr-4 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </button>

            <div>
              <h1 className="text-xl font-bold">
                {character?.name || "Nhân vật không xác định"}
              </h1>
              <div className="flex text-sm text-gray-400">
                <span>{character?.characterClass || ""}</span>
                {character?.level && (
                  <>
                    <span className="mx-1">•</span>
                    <span>Cấp {character.level}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="text-sm text-gray-400">
              Chế độ AI Story
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 container mx-auto p-4 md:p-6 flex flex-col md:flex-row gap-6">
        {/* Truyện chính */}
        <div className="flex-1">
          <div className="mb-4 bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h2 className="text-xl font-semibold mb-2">Câu chuyện của {character?.name}</h2>
            <p className="text-gray-400 text-sm">
              Hành trình của bạn sẽ được viết bởi trí tuệ nhân tạo dựa trên những lựa chọn của bạn.
            </p>
          </div>
          
          {/* Nội dung câu chuyện */}
          <div 
            ref={contentRef}
            className="bg-gray-800 rounded-lg p-4 border border-gray-700 mb-4 max-h-[60vh] overflow-y-auto scrollbar-thin"
          >
            {storyHistory.map((segment, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="prose prose-invert max-w-none mb-4 story-content">
                  {processStoryContent(segment.content)}
                </div>
                
                {index === storyHistory.length - 1 && !isProcessingChoice && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2 text-yellow-400">Lựa chọn của bạn:</h3>
                    <div className="space-y-2">
                      {segment.choices.map((choice, choiceIndex) => (
                        <button
                          key={choiceIndex}
                          onClick={() => handleChoiceSelected(choice)}
                          className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors flex items-center"
                        >
                          <span className="mr-2 text-yellow-400">{choiceIndex + 1}.</span>
                          <span>{choice}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {index === storyHistory.length - 1 && selectedChoice && (
                  <div className="mt-6 p-3 border border-yellow-600/30 bg-yellow-900/20 rounded-md">
                    <div className="text-yellow-400 font-semibold mb-2">Bạn đã chọn:</div>
                    <div>{selectedChoice}</div>
                  </div>
                )}
              </div>
            ))}
            
            {isProcessingChoice && (
              <div className="mt-6 p-4 bg-gray-700/50 rounded-md">
                <div className="flex items-center">
                  <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin mr-3"></div>
                  <span>Đang xử lý lựa chọn của bạn...</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Hiển thị bộ chọn phong cách khi đã chọn xong lựa chọn */}
          {selectedChoice && !isProcessingChoice && character && (
            <StoryStyleSelector
              currentContent={storyHistory[storyHistory.length - 1].content}
              characterInfo={character}
              previousChoices={storyHistory.map(segment => selectedChoice)}
              onContentGenerated={handleContentGenerated}
              onError={handleGenerationError}
            />
          )}
        </div>
        
        {/* Thông tin nhân vật */}
        <div className="md:w-80">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Thông tin nhân vật</h2>
            
            {character && (
              <>
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Thuộc tính</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(character.attributes).map(([key, value]) => (
                      <div key={key} className="flex justify-between bg-gray-700/50 p-2 rounded">
                        <span className="capitalize">{translateAttribute(key)}</span>
                        <span className="font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Kỹ năng</h3>
                  <div className="space-y-1">
                    {character.skills.map((skill, index) => (
                      <div key={index} className="bg-gray-700/50 p-2 rounded">
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Vật phẩm</h3>
                  <div className="space-y-1">
                    {character.inventory?.items.map((item, index) => (
                      <div key={index} className="bg-gray-700/50 p-2 rounded flex justify-between">
                        <span>{item.name}</span>
                        <span className="text-xs bg-gray-600 px-1.5 py-0.5 rounded capitalize">
                          {translateItemType(item.type || '')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hàm xử lý nội dung câu chuyện với màu sắc khác nhau
function processStoryContent(content: string) {
  if (!content) return null;
  
  // Các regex để nhận diện các phần khác nhau của câu chuyện
  const characterNameRegex = /([A-Za-z\u00C0-\u1EF9\s]+)\s*\(\s*màu\s+([a-zA-Z]+)\s*\)\s*:/g;
  const skillRegex = /\[([\w\s\u00C0-\u1EF9]+)\]/g;
  const itemRegex = /<([\w\s\u00C0-\u1EF9]+)>/g;
  const sectionRegex = /\[([A-Z\s]+)\]:/g;
  
  // Màu sắc tương ứng với từng loại
  const colorMap: Record<string, string> = {
    "xanh": "text-blue-400",
    "đỏ": "text-red-400",
    "lục": "text-green-400",
    "tím": "text-purple-400",
    "vàng": "text-yellow-400",
    "cam": "text-orange-400",
    "hồng": "text-pink-400",
    "lam": "text-indigo-400",
    "ngọc": "text-teal-400",
    "xám": "text-gray-400",
    "trắng": "text-white",
    "default": "text-blue-400" // Màu mặc định nếu không xác định
  };
  
  // Tạo các phần HTML
  let processedContent = content
    // Xử lý tiêu đề các phần
    .replace(sectionRegex, (match, section) => {
      return `<div class="text-amber-400 font-semibold mb-1 mt-3">[${section}]:</div>`;
    })
    // Xử lý tên nhân vật và lời nói
    .replace(characterNameRegex, (match, name, color) => {
      const colorClass = colorMap[color.toLowerCase()] || colorMap.default;
      return `<span class="${colorClass} font-semibold">${name}:</span>`;
    })
    // Xử lý kỹ năng
    .replace(skillRegex, (match, skill) => {
      return `<span class="text-purple-400 font-bold">[${skill}]</span>`;
    })
    // Xử lý vật phẩm
    .replace(itemRegex, (match, item) => {
      return `<span class="text-yellow-400 italic">&lt;${item}&gt;</span>`;
    });
  
  return <div dangerouslySetInnerHTML={{ __html: processedContent }} />;
}

// Hàm dịch các thuộc tính sang tiếng Việt
function translateAttribute(attribute: string): string {
  const translations: Record<string, string> = {
    strength: "Sức mạnh",
    agility: "Nhanh nhẹn",
    intelligence: "Trí tuệ",
    constitution: "Thể chất",
    luck: "May mắn",
    wisdom: "Minh triết",
    charisma: "Quyến rũ",
    dexterity: "Khéo léo",
    vitality: "Sinh lực"
  };
  
  return translations[attribute] || attribute;
}

// Hàm dịch loại vật phẩm sang tiếng Việt
function translateItemType(type: string): string {
  const translations: Record<string, string> = {
    weapon: "Vũ khí",
    armor: "Giáp",
    consumable: "Tiêu hao",
    accessory: "Phụ kiện",
    book: "Sách",
    quest: "Nhiệm vụ",
    material: "Nguyên liệu"
  };
  
  return translations[type] || type;
}