"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// Định nghĩa các thể loại game
const GAME_GENRES = [
  {
    id: "fantasy",
    name: "Fantasy",
    description: "Thế giới với phép thuật, hiệp sĩ, rồng và sinh vật huyền bí",
  },
  {
    id: "modern",
    name: "Modern",
    description: "Thế giới hiện đại với công nghệ và xã hội như thực tế",
  },
  {
    id: "scifi",
    name: "Sci-Fi",
    description: "Thế giới tương lai với công nghệ tiên tiến, du hành vũ trụ",
  },
  {
    id: "xianxia",
    name: "Tiên Hiệp",
    description: "Thế giới tu tiên, trau dồi linh khí, thăng cấp cảnh giới",
  },
  {
    id: "wuxia",
    name: "Võ Hiệp",
    description: "Thế giới võ thuật, giang hồ, kiếm hiệp",
  },
  {
    id: "horror",
    name: "Horror",
    description: "Thế giới đầy rẫy những sinh vật kinh dị, ma quỷ và sự sợ hãi",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description:
      "Thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể",
  },
  {
    id: "steampunk",
    name: "Steampunk",
    description:
      "Thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria",
  },
  {
    id: "postapocalyptic",
    name: "Post-Apocalyptic",
    description: "Thế giới sau thảm họa toàn cầu, con người phải sinh tồn",
  },
  {
    id: "historical",
    name: "Historical",
    description: "Thế giới dựa trên các giai đoạn lịch sử thực tế",
  },
];

// Định nghĩa các lớp nhân vật theo thể loại
const CHARACTER_CLASSES = {
  fantasy: [
    "Chiến binh",
    "Pháp sư",
    "Cung thủ",
    "Đạo tặc",
    "Giáo sĩ",
    "Hiệp sĩ",
    "Thuật sĩ",
  ],
  modern: [
    "Thám tử",
    "Bác sĩ",
    "Cảnh sát",
    "Hacker",
    "Nhà khoa học",
    "Vận động viên",
    "Nghệ sĩ",
  ],
  scifi: [
    "Phi hành gia",
    "Kỹ sư robot",
    "Lính đánh thuê",
    "Nhà khoa học",
    "Thợ săn tiền thưởng",
    "Phi công",
    "Hacker",
  ],
  xianxia: [
    "Kiếm tu",
    "Đan tu",
    "Phù tu",
    "Thể tu",
    "Linh tu",
    "Tâm tu",
    "Võ tu",
  ],
  wuxia: [
    "Kiếm khách",
    "Võ sư",
    "Thích khách",
    "Hiệp khách",
    "Thần y",
    "Độc sư",
    "Tiêu sư",
  ],
  horror: [
    "Thợ săn quỷ",
    "Nhà ngoại cảm",
    "Nhà khoa học",
    "Người sống sót",
    "Linh mục trừ tà",
    "Thám tử siêu nhiên",
    "Pháp sư",
  ],
  cyberpunk: [
    "Netrunner",
    "Lính đánh thuê",
    "Kỹ sư cấy ghép",
    "Sát thủ",
    "Hacker",
    "Cảnh sát",
    "Bác sĩ chợ đen",
  ],
  steampunk: [
    "Nhà phát minh",
    "Phi công",
    "Thám tử",
    "Quý tộc",
    "Cơ khí sư",
    "Nhà thám hiểm",
    "Thủy thủ",
  ],
  postapocalyptic: [
    "Người sống sót",
    "Chiến binh",
    "Thợ săn",
    "Thầy thuốc",
    "Kỹ sư",
    "Thủ lĩnh",
    "Trinh sát",
  ],
  historical: [
    "Hiệp sĩ",
    "Thương nhân",
    "Học giả",
    "Thám tử",
    "Quý tộc",
    "Thủy thủ",
    "Thợ săn",
  ],
};

export default function CreateCharacterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedGenre = searchParams.get("genre");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [generatedCharacter, setGeneratedCharacter] = useState(null);
  const [useAI, setUseAI] = useState(false);

  // Form state
  const [characterData, setCharacterData] = useState({
    name: "",
    characterClass: "",
    primaryGenre: preselectedGenre || "fantasy",
    secondaryGenres: [],
    customGenreDescription: "",
    backstory: "",
    attributes: {
      strength: 10,
      intelligence: 10,
      dexterity: 10,
      charisma: 10,
      health: 100,
      mana: 100,
    },
    skills: [],
  });

  // AI generation state
  const [aiDescription, setAiDescription] = useState("");

  // Xử lý thay đổi form
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setCharacterData({
        ...characterData,
        [parent]: {
          ...characterData[parent],
          [child]: value,
        },
      });
    } else {
      setCharacterData({
        ...characterData,
        [name]: value,
      });
    }
  };

  // Xử lý thay đổi thể loại phụ
  const handleSecondaryGenreChange = (genreId) => {
    const currentSecondaryGenres = [...characterData.secondaryGenres];

    if (currentSecondaryGenres.includes(genreId)) {
      // Nếu đã có, loại bỏ
      const updatedGenres = currentSecondaryGenres.filter(
        (id) => id !== genreId
      );
      setCharacterData({
        ...characterData,
        secondaryGenres: updatedGenres,
      });
    } else {
      // Nếu chưa có và chưa đạt giới hạn 2 thể loại phụ, thêm vào
      if (currentSecondaryGenres.length < 2) {
        setCharacterData({
          ...characterData,
          secondaryGenres: [...currentSecondaryGenres, genreId],
        });
      }
    }
  };

  // Xử lý thay đổi thuộc tính
  const handleAttributeChange = (attribute, value) => {
    setCharacterData({
      ...characterData,
      attributes: {
        ...characterData.attributes,
        [attribute]: parseInt(value),
      },
    });
  };

  // Xử lý thêm/xóa kỹ năng
  const handleSkillChange = (skill) => {
    const currentSkills = [...characterData.skills];

    if (currentSkills.includes(skill)) {
      // Nếu đã có, loại bỏ
      const updatedSkills = currentSkills.filter((s) => s !== skill);
      setCharacterData({
        ...characterData,
        skills: updatedSkills,
      });
    } else {
      // Nếu chưa có, thêm vào
      setCharacterData({
        ...characterData,
        skills: [...currentSkills, skill],
      });
    }
  };

  // Tạo nhân vật bằng AI
  const generateCharacter = async () => {
    if (!aiDescription.trim()) {
      setError("Vui lòng nhập mô tả cho nhân vật");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/api/game/characters/generate", {
        description: aiDescription,
        primaryGenre: characterData.primaryGenre,
        secondaryGenres: characterData.secondaryGenres,
        customGenreDescription: characterData.customGenreDescription,
      });

      setGeneratedCharacter(response.data);
      setCharacterData(response.data);
      setSuccess(true);
      setStep(4); // Chuyển đến bước xem trước
      setLoading(false);
    } catch (err) {
      console.error("Error generating character:", err);
      setError("Không thể tạo nhân vật. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Tạo nhân vật thủ công
  const createCharacter = async () => {
    // Kiểm tra dữ liệu
    if (!characterData.name.trim()) {
      setError("Vui lòng nhập tên nhân vật");
      return;
    }

    if (!characterData.characterClass.trim()) {
      setError("Vui lòng chọn lớp nhân vật");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.post("/api/game/characters", characterData);

      setSuccess(true);
      router.push(`/game/characters/${response.data.id}`);
    } catch (err) {
      console.error("Error creating character:", err);
      setError("Không thể tạo nhân vật. Vui lòng thử lại sau.");
      setLoading(false);
    }
  };

  // Danh sách kỹ năng theo thể loại
  const getSkillsByGenre = (genre) => {
    const skillsByGenre = {
      fantasy: [
        "Kiếm thuật",
        "Phép thuật",
        "Cung thuật",
        "Đánh cận chiến",
        "Ẩn nấp",
        "Sinh tồn",
        "Thuốc",
        "Khảo cổ",
        "Lịch sử cổ đại",
        "Nhận biết ma thuật",
      ],
      modern: [
        "Lái xe",
        "Sơ cứu",
        "Công nghệ",
        "Thuyết phục",
        "Điều tra",
        "Thể thao",
        "Nấu ăn",
        "Nghệ thuật",
        "Ngôn ngữ",
        "Kinh doanh",
      ],
      scifi: [
        "Lập trình",
        "Sửa chữa robot",
        "Lái tàu vũ trụ",
        "Kiến thức ngoài hành tinh",
        "Vũ khí năng lượng",
        "Sinh học không gian",
        "Vật lý lượng tử",
        "Sinh tồn không gian",
        "Chiến thuật",
        "Hack hệ thống",
      ],
      xianxia: [
        "Kiếm đạo",
        "Luyện đan",
        "Tu luyện",
        "Phù văn",
        "Thiên nhãn",
        "Thần thức",
        "Kiếm ý",
        "Ngộ tính",
        "Đạo tâm",
        "Linh thức",
      ],
      wuxia: [
        "Kiếm pháp",
        "Quyền pháp",
        "Khinh công",
        "Nội công",
        "Điểm huyệt",
        "Y thuật",
        "Độc thuật",
        "Ám khí",
        "Võ học",
        "Thiên văn địa lý",
      ],
      horror: [
        "Trừ tà",
        "Kiến thức huyền bí",
        "Điều tra",
        "Sinh tồn",
        "Tâm lý học",
        "Sơ cứu",
        "Lịch sử huyền bí",
        "Vũ khí",
        "Nhận biết siêu nhiên",
        "Nghi thức cổ đại",
      ],
      cyberpunk: [
        "Hack",
        "Cấy ghép",
        "Vũ khí",
        "Điện tử",
        "Lái xe",
        "Thị trường đen",
        "Kiến thức đường phố",
        "Sơ cứu",
        "Thương lượng",
        "Giả mạo",
      ],
      steampunk: [
        "Cơ khí",
        "Phát minh",
        "Lái máy bay",
        "Hóa học",
        "Xã giao",
        "Lịch sử",
        "Điều tra",
        "Vũ khí",
        "Thiên văn học",
        "Hàng hải",
      ],
      postapocalyptic: [
        "Sinh tồn",
        "Săn bắn",
        "Sơ cứu",
        "Sửa chữa",
        "Nấu ăn dã chiến",
        "Tìm kiếm",
        "Chiến đấu",
        "Nông nghiệp",
        "Đàm phán",
        "Định hướng",
      ],
      historical: [
        "Kiếm thuật",
        "Cưỡi ngựa",
        "Xã giao",
        "Lịch sử",
        "Ngôn ngữ cổ",
        "Hàng hải",
        "Chiến thuật",
        "Y học cổ truyền",
        "Thương mại",
        "Nghệ thuật",
      ],
    };

    return skillsByGenre[genre] || skillsByGenre.fantasy;
  };

  // Render các bước tạo nhân vật
  const renderStep = () => {
    switch (step) {
      case 1: // Chọn phương thức tạo nhân vật
        return (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Chọn Phương Thức Tạo Nhân Vật
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <button
                onClick={() => {
                  setUseAI(false);
                  setStep(2);
                }}
                className="bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">Tạo Thủ Công</h3>
                <p className="text-sm text-gray-300">
                  Tự thiết kế nhân vật của bạn với đầy đủ tùy chỉnh
                </p>
              </button>

              <button
                onClick={() => {
                  setUseAI(true);
                  setStep(2);
                }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-6 rounded-xl transition-all transform hover:scale-105 flex flex-col items-center text-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-xl font-bold mb-2">Tạo Bằng AI</h3>
                <p className="text-sm text-gray-300">
                  Mô tả nhân vật bạn muốn và để AI tạo ra nhân vật hoàn chỉnh
                </p>
              </button>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/game"
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                Quay lại trang chủ
              </Link>
            </div>
          </div>
        );

      case 2: // Chọn thể loại
        return (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Chọn Thể Loại
            </h2>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Thể loại chính</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {GAME_GENRES.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() =>
                      setCharacterData({
                        ...characterData,
                        primaryGenre: genre.id,
                      })
                    }
                    className={`p-3 rounded-lg text-center transition-colors ${
                      characterData.primaryGenre === genre.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 mb-2">
                Thể loại phụ (tối đa 2)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {GAME_GENRES.filter(
                  (genre) => genre.id !== characterData.primaryGenre
                ).map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    onClick={() => handleSecondaryGenreChange(genre.id)}
                    className={`p-3 rounded-lg text-center transition-colors ${
                      characterData.secondaryGenres.includes(genre.id)
                        ? "bg-green-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    } ${
                      characterData.secondaryGenres.length >= 2 &&
                      !characterData.secondaryGenres.includes(genre.id)
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={
                      characterData.secondaryGenres.length >= 2 &&
                      !characterData.secondaryGenres.includes(genre.id)
                    }
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-gray-300 mb-2">
                Mô tả thể loại tùy chỉnh (tùy chọn)
              </label>
              <textarea
                name="customGenreDescription"
                value={characterData.customGenreDescription}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Mô tả thêm về thế giới và bối cảnh bạn muốn..."
              />
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(useAI ? 3 : 4)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
              >
                Tiếp tục
              </button>
            </div>
          </div>
        );

      case 3: // Tạo nhân vật bằng AI
        return (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Tạo Nhân Vật Bằng AI
            </h2>

            <div className="mb-8">
              <label className="block text-gray-300 mb-2">
                Mô tả nhân vật của bạn
              </label>
              <textarea
                value={aiDescription}
                onChange={(e) => setAiDescription(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={6}
                placeholder="Mô tả chi tiết về nhân vật bạn muốn tạo. Ví dụ: Một chiến binh trẻ với khả năng đặc biệt, xuất thân từ một ngôi làng nhỏ, có ước mơ trở thành hiệp sĩ vĩ đại..."
              />
              <p className="text-gray-400 text-sm mt-2">
                Mô tả càng chi tiết, nhân vật được tạo ra càng phù hợp với mong
                muốn của bạn.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                disabled={loading}
              >
                Quay lại
              </button>
              <button
                onClick={generateCharacter}
                className={`px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-md transition-colors flex items-center ${
                  loading ? "opacity-70 cursor-wait" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang tạo...
                  </>
                ) : (
                  "Tạo nhân vật"
                )}
              </button>
            </div>
          </div>
        );

      case 4: // Tạo nhân vật thủ công hoặc xem trước nhân vật AI
        return (
          <div className="bg-gray-800 rounded-xl p-8 shadow-lg max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">
              {useAI ? "Xem Trước Nhân Vật" : "Tạo Nhân Vật"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">
                    Tên nhân vật
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={characterData.name}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên nhân vật"
                    disabled={useAI && loading}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">
                    Lớp nhân vật
                  </label>
                  <select
                    name="characterClass"
                    value={characterData.characterClass}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={useAI && loading}
                  >
                    <option value="">Chọn lớp nhân vật</option>
                    {CHARACTER_CLASSES[characterData.primaryGenre]?.map(
                      (className) => (
                        <option key={className} value={className}>
                          {className}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Tiểu sử</label>
                  <textarea
                    name="backstory"
                    value={characterData.backstory}
                    onChange={handleChange}
                    className="w-full bg-gray-700 text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={5}
                    placeholder="Mô tả về quá khứ và lai lịch của nhân vật..."
                    disabled={useAI && loading}
                  />
                </div>
              </div>

              <div>
                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">Thuộc tính</label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(characterData.attributes).map(
                      ([attribute, value]) => (
                        <div key={attribute} className="mb-3">
                          <label className="block text-gray-400 text-sm mb-1 capitalize">
                            {attribute === "strength"
                              ? "Sức mạnh"
                              : attribute === "intelligence"
                              ? "Trí tuệ"
                              : attribute === "dexterity"
                              ? "Nhanh nhẹn"
                              : attribute === "charisma"
                              ? "Quyến rũ"
                              : attribute === "health"
                              ? "Sinh lực"
                              : attribute === "mana"
                              ? "Năng lượng"
                              : attribute}
                          </label>
                          <input
                            type="range"
                            min={
                              attribute === "health" || attribute === "mana"
                                ? 50
                                : 5
                            }
                            max={
                              attribute === "health" || attribute === "mana"
                                ? 200
                                : 20
                            }
                            value={value}
                            onChange={(e) =>
                              handleAttributeChange(attribute, e.target.value)
                            }
                            className="w-full"
                            disabled={useAI && loading}
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>{value}</span>
                            <span>
                              {attribute === "health" || attribute === "mana"
                                ? 200
                                : 20}
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-300 mb-2">
                    Kỹ năng (chọn tối đa 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {getSkillsByGenre(characterData.primaryGenre).map(
                      (skill) => (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => handleSkillChange(skill)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            characterData.skills.includes(skill)
                              ? "bg-green-600 text-white"
                              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                          } ${
                            characterData.skills.length >= 5 &&
                            !characterData.skills.includes(skill)
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          disabled={
                            (characterData.skills.length >= 5 &&
                              !characterData.skills.includes(skill)) ||
                            (useAI && loading)
                          }
                        >
                          {skill}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/50 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(useAI ? 3 : 2)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                disabled={loading}
              >
                Quay lại
              </button>
              <button
                onClick={createCharacter}
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-md transition-colors flex items-center ${
                  loading ? "opacity-70 cursor-wait" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang lưu...
                  </>
                ) : (
                  "Tạo nhân vật"
                )}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-12 px-4">
      {renderStep()}
    </div>
  );
}
