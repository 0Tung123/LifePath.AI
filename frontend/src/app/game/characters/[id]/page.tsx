"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

// TypeScript interfaces
interface CharacterAttributes {
  strength: number;
  intelligence: number;
  dexterity: number;
  charisma: number;
  health: number;
  mana: number;
  cultivation?: number;
  qi?: number;
  perception?: number;
  tech?: number;
  hacking?: number;
  piloting?: number;
  sanity?: number;
  willpower?: number;
  education?: number;
  wealth?: number;
  influence?: number;
}

interface SpecialAbility {
  name: string;
  description: string;
  cooldown?: number;
  cost?: {
    amount: number;
    type: string;
  };
}

interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  type?: string;
  rarity?: "common" | "uncommon" | "rare" | "epic" | "legendary";
  quantity: number;
  value?: number;
}

interface Inventory {
  currency?: Record<string, number>;
  items?: InventoryItem[];
}

interface Character {
  id: string;
  name: string;
  characterClass: string;
  level: number;
  primaryGenre: string;
  secondaryGenres?: string[];
  attributes: CharacterAttributes;
  skills?: string[];
  specialAbilities?: SpecialAbility[];
  backstory?: string;
  equipment?: string[];
  inventory?: Inventory;
}

// Ánh xạ tên thuộc tính sang tiếng Việt
const attributeNames: Record<string, string> = {
  strength: "Sức mạnh",
  intelligence: "Trí tuệ",
  dexterity: "Nhanh nhẹn",
  charisma: "Quyến rũ",
  health: "Sinh lực",
  mana: "Năng lượng",
  cultivation: "Tu vi",
  qi: "Khí",
  perception: "Nhận thức",
  tech: "Công nghệ",
  hacking: "Hack",
  piloting: "Lái tàu",
  sanity: "Tỉnh táo",
  willpower: "Ý chí",
  education: "Học vấn",
  wealth: "Tài sản",
  influence: "Ảnh hưởng",
};

// Ánh xạ thể loại sang tiếng Việt
const genreNames: Record<string, string> = {
  fantasy: "Fantasy",
  modern: "Hiện đại",
  scifi: "Khoa học viễn tưởng",
  xianxia: "Tiên Hiệp",
  wuxia: "Võ Hiệp",
  horror: "Kinh dị",
  cyberpunk: "Cyberpunk",
  steampunk: "Steampunk",
  postapocalyptic: "Hậu tận thế",
  historical: "Lịch sử",
};

export default function CharacterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingGame, setStartingGame] = useState(false);

  useEffect(() => {
    const fetchCharacter = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/game/characters/${id}`);
        setCharacter(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching character:", err);
        setError("Không thể tải thông tin nhân vật. Vui lòng thử lại sau.");
        setLoading(false);
      }
    };

    if (id) {
      fetchCharacter();
    }
  }, [id]);

  const startNewGame = async () => {
    try {
      setStartingGame(true);
      const response = await axios.post("/api/game/sessions", {
        characterId: id,
      });
      router.push(`/game/play/${response.data.id}`);
    } catch (err) {
      console.error("Error starting game:", err);
      setError("Không thể bắt đầu phiên game. Vui lòng thử lại sau.");
      setStartingGame(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-2xl font-bold mb-4">
            Đang tải thông tin nhân vật...
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

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Không tìm thấy nhân vật</div>
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

  // Xác định màu nền dựa trên thể loại
  const getGenreGradient = (genre: string) => {
    const gradients: Record<string, string> = {
      fantasy: "from-blue-600 to-purple-600",
      modern: "from-gray-600 to-blue-600",
      scifi: "from-cyan-500 to-blue-500",
      xianxia: "from-yellow-400 to-orange-500",
      wuxia: "from-red-500 to-pink-500",
      horror: "from-gray-800 to-red-900",
      cyberpunk: "from-purple-600 to-pink-600",
      steampunk: "from-amber-600 to-yellow-600",
      postapocalyptic: "from-green-900 to-yellow-800",
      historical: "from-amber-800 to-yellow-700",
    };

    return gradients[genre] || "from-blue-600 to-purple-600";
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <Link
            href="/game"
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Quay lại
          </Link>

          <button
            onClick={startNewGame}
            disabled={startingGame}
            className={`px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 rounded-md transition-colors flex items-center ${
              startingGame ? "opacity-70 cursor-wait" : ""
            }`}
          >
            {startingGame ? (
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
                Đang bắt đầu...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
                Bắt đầu phiêu lưu
              </>
            )}
          </button>
        </div>

        {/* Character Header */}
        <div
          className={`bg-gradient-to-r ${getGenreGradient(
            character.primaryGenre
          )} rounded-xl p-8 shadow-lg mb-8`}
        >
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{character.name}</h1>
              <div className="flex items-center mb-4">
                <span className="text-xl">{character.characterClass}</span>
                <span className="mx-2">•</span>
                <span className="bg-black/30 px-3 py-1 rounded-full text-sm">
                  Cấp {character.level}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {genreNames[character.primaryGenre] || character.primaryGenre}
                </span>
                {character.secondaryGenres?.map((genre) => (
                  <span
                    key={genre}
                    className="bg-white/10 px-3 py-1 rounded-full text-sm"
                  >
                    {genreNames[genre] || genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex items-center">
              <div className="text-center mr-6">
                <div className="text-3xl font-bold">{character.level}</div>
                <div className="text-xs text-gray-300">Cấp độ</div>
              </div>

              <div className="w-24 h-24 rounded-full bg-gray-700 border-4 border-white/20 flex items-center justify-center">
                <span className="text-4xl font-bold">
                  {character.name.charAt(0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Character Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Attributes */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-blue-400">
              Thuộc tính
            </h2>

            <div className="space-y-4">
              {Object.entries(character.attributes).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <div className="w-1/3 text-gray-400">
                    {attributeNames[key] || key}
                  </div>
                  <div className="w-2/3">
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          key === "health"
                            ? "bg-red-500"
                            : key === "mana"
                            ? "bg-blue-500"
                            : key === "strength"
                            ? "bg-orange-500"
                            : key === "intelligence"
                            ? "bg-purple-500"
                            : key === "dexterity"
                            ? "bg-green-500"
                            : key === "charisma"
                            ? "bg-pink-500"
                            : "bg-yellow-500"
                        }`}
                        style={{
                          width: `${
                            key === "health" || key === "mana"
                              ? Math.min(100, (value / 200) * 100)
                              : Math.min(100, (value / 20) * 100)
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span>{value}</span>
                      <span>
                        {key === "health" || key === "mana" ? "200" : "20"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column - Skills & Abilities */}
          <div className="space-y-8">
            {/* Skills */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-green-400">
                Kỹ năng
              </h2>

              {character.skills && character.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {character.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Nhân vật chưa có kỹ năng nào</p>
              )}
            </div>

            {/* Special Abilities */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-purple-400">
                Khả năng đặc biệt
              </h2>

              {character.specialAbilities &&
              character.specialAbilities.length > 0 ? (
                <div className="space-y-4">
                  {character.specialAbilities.map((ability, index) => (
                    <div key={index} className="bg-gray-700 p-4 rounded-lg">
                      <h3 className="font-bold text-lg mb-1">{ability.name}</h3>
                      <p className="text-gray-300 text-sm mb-2">
                        {ability.description}
                      </p>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                        {ability.cooldown && (
                          <span>Hồi chiêu: {ability.cooldown} lượt</span>
                        )}

                        {ability.cost && (
                          <span>
                            Chi phí: {ability.cost.amount} {ability.cost.type}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">
                  Nhân vật chưa có khả năng đặc biệt nào
                </p>
              )}
            </div>
          </div>

          {/* Right Column - Inventory & Backstory */}
          <div className="space-y-8">
            {/* Inventory */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-yellow-400">
                Hành trang
              </h2>

              {character.inventory && (
                <>
                  {/* Currency */}
                  {character.inventory.currency &&
                    Object.keys(character.inventory.currency).length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-gray-400 text-sm mb-2">Tiền tệ</h3>
                        <div className="flex flex-wrap gap-3">
                          {Object.entries(character.inventory.currency).map(
                            ([currency, amount]) => (
                              <div
                                key={currency}
                                className="bg-gray-700 px-3 py-1 rounded-lg flex items-center"
                              >
                                <span className="text-yellow-300 mr-1">
                                  {currency === "gold"
                                    ? "💰"
                                    : currency === "credits"
                                    ? "💳"
                                    : currency === "yuan"
                                    ? "💴"
                                    : currency === "spirit_stones"
                                    ? "💎"
                                    : "🪙"}
                                </span>
                                <span>
                                  {amount}{" "}
                                  {currency === "gold"
                                    ? "Vàng"
                                    : currency === "credits"
                                    ? "Credits"
                                    : currency === "yuan"
                                    ? "Yuan"
                                    : currency === "spirit_stones"
                                    ? "Linh thạch"
                                    : currency.replace("_", " ")}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Items */}
                  {character.inventory.items &&
                  character.inventory.items.length > 0 ? (
                    <div>
                      <h3 className="text-gray-400 text-sm mb-2">Vật phẩm</h3>
                      <div className="space-y-2">
                        {character.inventory.items.map((item) => (
                          <div
                            key={item.id}
                            className="bg-gray-700 p-3 rounded-lg"
                          >
                            <div className="flex justify-between">
                              <h4 className="font-medium">
                                {item.name}
                                {item.quantity > 1 && (
                                  <span className="text-gray-400 text-sm ml-1">
                                    x{item.quantity}
                                  </span>
                                )}
                              </h4>
                              {item.rarity && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    item.rarity === "common"
                                      ? "bg-gray-600 text-gray-300"
                                      : item.rarity === "uncommon"
                                      ? "bg-green-800 text-green-300"
                                      : item.rarity === "rare"
                                      ? "bg-blue-800 text-blue-300"
                                      : item.rarity === "epic"
                                      ? "bg-purple-800 text-purple-300"
                                      : item.rarity === "legendary"
                                      ? "bg-orange-800 text-orange-300"
                                      : "bg-gray-600 text-gray-300"
                                  }`}
                                >
                                  {item.rarity === "common"
                                    ? "Thường"
                                    : item.rarity === "uncommon"
                                    ? "Không phổ biến"
                                    : item.rarity === "rare"
                                    ? "Hiếm"
                                    : item.rarity === "epic"
                                    ? "Sử thi"
                                    : item.rarity === "legendary"
                                    ? "Huyền thoại"
                                    : item.rarity}
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-gray-400 text-sm mt-1">
                                {item.description}
                              </p>
                            )}
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              {item.type && <span>{item.type}</span>}
                              {item.value && <span>{item.value} vàng</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-400">Hành trang trống</p>
                  )}
                </>
              )}
            </div>

            {/* Backstory */}
            <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-pink-400">Tiểu sử</h2>

              {character.backstory ? (
                <p className="text-gray-300 whitespace-pre-line">
                  {character.backstory}
                </p>
              ) : (
                <p className="text-gray-400">Chưa có thông tin về tiểu sử</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
