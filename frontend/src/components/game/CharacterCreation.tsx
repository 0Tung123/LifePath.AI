import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

interface GameGenre {
  id: string;
  name: string;
  description: string;
}

interface CharacterCreationProps {
  onCharacterCreated?: (characterId: string) => void;
}

const CharacterCreation: React.FC<CharacterCreationProps> = ({ onCharacterCreated }) => {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [background, setBackground] = useState('');
  const [introduction, setIntroduction] = useState('');
  const [genres, setGenres] = useState<GameGenre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState({
    title: '',
    background: '',
    introduction: ''
  });

  useEffect(() => {
    // Lấy danh sách thể loại từ API
    const fetchGenres = async () => {
      try {
        const response = await api.get('/game/genres');
        setGenres(response.data);
        if (response.data.length > 0) {
          setSelectedGenre(response.data[0].id);
        }
      } catch (error) {
        console.error('Lỗi khi lấy danh sách thể loại:', error);
        setError('Không thể tải danh sách thể loại game. Vui lòng thử lại sau.');
      }
    };

    fetchGenres();
  }, []);

  const handleGenerateAiSuggestion = async (type: 'title' | 'background' | 'introduction') => {
    if (!name || !selectedGenre) {
      setError('Vui lòng nhập tên nhân vật và chọn thể loại trước khi tạo gợi ý từ AI');
      return;
    }

    setIsAiGenerating(true);
    try {
      // Tạo prompt dựa trên thông tin đã có
      const genreObj = genres.find(g => g.id === selectedGenre);
      const genreName = genreObj ? genreObj.name : selectedGenre;
      
      let prompt = '';
      if (type === 'title') {
        prompt = `Gợi ý một tiêu đề ngắn gọn cho câu chuyện về nhân vật ${name}, một ${gender === 'male' ? 'nam' : 'nữ'} trong thế giới ${genreName}.`;
      } else if (type === 'background') {
        prompt = `Gợi ý một bối cảnh ngắn gọn (2-3 câu) cho nhân vật ${name}, một ${gender === 'male' ? 'nam' : 'nữ'} trong thế giới ${genreName}.`;
      } else if (type === 'introduction') {
        prompt = `Viết một đoạn giới thiệu ngắn (3-4 câu) về nhân vật ${name}, một ${gender === 'male' ? 'nam' : 'nữ'} trong thế giới ${genreName}. ${background ? 'Bối cảnh: ' + background : ''}`;
      }

      // Gọi API AI để tạo gợi ý
      const response = await api.post('/ai/generate', { prompt });
      
      // Cập nhật state với gợi ý từ AI
      setAiSuggestion(prev => ({
        ...prev,
        [type]: response.data.content
      }));
      
      // Tự động điền gợi ý vào trường nhập liệu
      if (type === 'title') setTitle(response.data.content);
      else if (type === 'background') setBackground(response.data.content);
      else if (type === 'introduction') setIntroduction(response.data.content);
      
    } catch (error) {
      console.error('Lỗi khi tạo gợi ý từ AI:', error);
      setError('Không thể tạo gợi ý từ AI. Vui lòng thử lại sau.');
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleCreateCharacter = async () => {
    if (!name) {
      setError('Vui lòng nhập tên nhân vật');
      return;
    }

    setIsSubmitting(true);
    try {
      // Tạo mô tả tổng hợp từ các thông tin đã nhập
      const description = `
        Tên: ${name}
        Giới tính: ${gender === 'male' ? 'Nam' : 'Nữ'}
        ${background ? 'Bối cảnh: ' + background : ''}
        ${introduction ? 'Giới thiệu: ' + introduction : ''}
      `;

      // Gọi API để tạo nhân vật
      const response = await api.post('/game/characters/generate', {
        description,
        primaryGenre: selectedGenre,
      });

      // Xử lý khi tạo nhân vật thành công
      if (response.data && response.data.id) {
        // Lưu thêm thông tin title và các field khác vào character
        await api.post(`/game/characters/${response.data.id}/metadata`, {
          title,
          gender,
          background,
          introduction
        });

        if (onCharacterCreated) {
          onCharacterCreated(response.data.id);
        } else {
          // Chuyển đến trang danh sách nhân vật hoặc trang chơi game
          router.push('/game/characters');
        }
      }
    } catch (error) {
      console.error('Lỗi khi tạo nhân vật:', error);
      setError('Không thể tạo nhân vật. Vui lòng thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-white">
      <h1 className="text-2xl font-bold text-center mb-6">Tạo Nhân Vật Mới</h1>
      
      {error && (
        <div className="bg-red-500 text-white p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Tiêu đề */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tiêu đề câu chuyện
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề câu chuyện của bạn"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleGenerateAiSuggestion('title')}
              disabled={isAiGenerating}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50"
            >
              {isAiGenerating ? 'Đang tạo...' : 'Gợi ý'}
            </button>
          </div>
        </div>

        {/* Tên nhân vật */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Tên nhân vật <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên nhân vật của bạn"
            className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Giới tính */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Giới tính
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                checked={gender === 'male'}
                onChange={() => setGender('male')}
                className="mr-2"
              />
              Nam
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="gender"
                checked={gender === 'female'}
                onChange={() => setGender('female')}
                className="mr-2"
              />
              Nữ
            </label>
          </div>
        </div>

        {/* Thể loại */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Thể loại <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name} - {genre.description}
              </option>
            ))}
          </select>
        </div>

        {/* Bối cảnh */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Bối cảnh
          </label>
          <div className="flex gap-2">
            <textarea
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="Mô tả bối cảnh của nhân vật (tùy chọn)"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <button
              onClick={() => handleGenerateAiSuggestion('background')}
              disabled={isAiGenerating}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 h-fit"
            >
              {isAiGenerating ? 'Đang tạo...' : 'Gợi ý'}
            </button>
          </div>
        </div>

        {/* Giới thiệu */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Giới thiệu bản thân
          </label>
          <div className="flex gap-2">
            <textarea
              value={introduction}
              onChange={(e) => setIntroduction(e.target.value)}
              placeholder="Viết giới thiệu ngắn về nhân vật của bạn (tùy chọn)"
              className="w-full p-3 bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            />
            <button
              onClick={() => handleGenerateAiSuggestion('introduction')}
              disabled={isAiGenerating}
              className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300 disabled:opacity-50 h-fit"
            >
              {isAiGenerating ? 'Đang tạo...' : 'Gợi ý'}
            </button>
          </div>
        </div>

        {/* Nút tạo nhân vật */}
        <div className="flex justify-center mt-8">
          <button
            onClick={handleCreateCharacter}
            disabled={isSubmitting || !name || !selectedGenre}
            className="px-6 py-3 bg-green-600 rounded-md hover:bg-green-700 transition duration-300 disabled:opacity-50 font-bold text-lg"
          >
            {isSubmitting ? 'Đang tạo nhân vật...' : 'Tạo nhân vật'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreation;