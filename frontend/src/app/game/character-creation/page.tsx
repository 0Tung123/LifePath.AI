"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/game-store";

type CreationMethod = "manual" | "ai";
type GameGenre = "fantasy" | "modern" | "scifi" | "xianxia" | "wuxia" | "horror" | "cyberpunk" | "steampunk" | "postapocalyptic" | "historical";

interface GenreOption {
  id: GameGenre;
  name: string;
  description: string;
}

const genreOptions: GenreOption[] = [
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
    description: "Thế giới tương lai đen tối với công nghệ cao, tập đoàn lớn và cấy ghép cơ thể",
  },
  {
    id: "steampunk",
    name: "Steampunk",
    description: "Thế giới thay thế với công nghệ hơi nước tiên tiến, thường có bối cảnh thời Victoria",
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

export default function CharacterCreationPage() {
  const router = useRouter();
  const { createCharacter, generateCharacter, isLoading, error } = useGameStore();
  
  const [creationMethod, setCreationMethod] = useState<CreationMethod>("manual");
  const [selectedGenre, setSelectedGenre] = useState<GameGenre>("fantasy");
  
  // Manual creation form state
  const [name, setName] = useState("");
  const [characterClass, setCharacterClass] = useState("");
  const [gender, setGender] = useState("male");
  const [attributes, setAttributes] = useState({
    strength: 10,
    intelligence: 10,
    dexterity: 10,
    charisma: 10,
    health: 100,
    mana: 100,
  });
  const [remainingPoints, setRemainingPoints] = useState(10);
  const [backstory, setBackstory] = useState("");
  
  // AI generation form state
  const [characterDescription, setCharacterDescription] = useState("");
  
  const handleAttributeChange = (attribute: string, value: number) => {
    const currentValue = attributes[attribute as keyof typeof attributes] || 0;
    const diff = value - currentValue;
    
    if (diff > 0 && remainingPoints < diff) {
      return; // Not enough points
    }
    
    setAttributes({
      ...attributes,
      [attribute]: value,
    });
    
    setRemainingPoints(remainingPoints - diff);
  };
  
  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const characterData = {
        name,
        characterClass,
        primaryGenre: selectedGenre,
        attributes,
        skills: [],
        inventory: {
          items: [],
          currency: {},
        },
        backstory,
      };
      
      const character = await createCharacter(characterData);
      router.push(`/game/play?characterId=${character.id}`);
    } catch (error) {
      console.error("Failed to create character:", error);
    }
  };
  
  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const character = await generateCharacter(characterDescription, selectedGenre);
      router.push(`/game/play?characterId=${character.id}`);
    } catch (error) {
      console.error("Failed to generate character:", error);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Character</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Choose Game Genre</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {genreOptions.map((genre) => (
            <div
              key={genre.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedGenre === genre.id
                  ? "border-primary-500 bg-primary-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => setSelectedGenre(genre.id)}
            >
              <h3 className="font-medium text-lg mb-1">{genre.name}</h3>
              <p className="text-sm text-gray-600">{genre.description}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Creation Method</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <div
            className={`flex-1 border rounded-lg p-6 cursor-pointer transition-colors ${
              creationMethod === "manual"
                ? "border-primary-500 bg-primary-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setCreationMethod("manual")}
          >
            <h3 className="font-medium text-xl mb-2">Manual Creation</h3>
            <p className="text-gray-600 mb-4">
              Create your character by manually setting attributes, skills, and background.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Full control over character details</li>
              <li>Customize attributes and skills</li>
              <li>Write your own backstory</li>
            </ul>
          </div>
          
          <div
            className={`flex-1 border rounded-lg p-6 cursor-pointer transition-colors ${
              creationMethod === "ai"
                ? "border-primary-500 bg-primary-50"
                : "hover:bg-gray-50"
            }`}
            onClick={() => setCreationMethod("ai")}
          >
            <h3 className="font-medium text-xl mb-2">AI Generation</h3>
            <p className="text-gray-600 mb-4">
              Let AI create a character based on your description.
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600">
              <li>Quick character creation</li>
              <li>Provide a brief description</li>
              <li>AI generates complete character details</li>
            </ul>
          </div>
        </div>
      </div>
      
      {creationMethod === "manual" ? (
        <form onSubmit={handleManualSubmit} className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Manual Character Creation</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">Character Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Character Class</label>
              <input
                type="text"
                value={characterClass}
                onChange={(e) => setCharacterClass(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
                placeholder="Warrior, Mage, Rogue, etc."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">Attributes</h3>
              <span className="text-sm">
                Remaining Points: <span className="font-medium">{remainingPoints}</span>
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(attributes).map(([attr, value]) => (
                <div key={attr} className="border rounded-md p-3">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium capitalize">{attr}</label>
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                  <input
                    type="range"
                    min={attr === "health" || attr === "mana" ? 50 : 5}
                    max={attr === "health" || attr === "mana" ? 150 : 20}
                    value={value}
                    onChange={(e) => handleAttributeChange(attr, parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              ))}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Backstory (Optional)</label>
            <textarea
              value={backstory}
              onChange={(e) => setBackstory(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-32"
              placeholder="Write a brief backstory for your character..."
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:bg-gray-400"
            >
              {isLoading ? "Creating..." : "Create Character"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleAISubmit} className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">AI Character Generation</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">
              Character Description
            </label>
            <textarea
              value={characterDescription}
              onChange={(e) => setCharacterDescription(e.target.value)}
              className="w-full px-3 py-2 border rounded-md h-40"
              required
              placeholder="Describe your character in a few sentences. For example: 'An old wizard librarian who guards ancient tomes of forbidden knowledge. He's wise but eccentric, with a mysterious past.'"
            />
            <p className="text-sm text-gray-500 mt-1">
              The more details you provide, the better the AI can generate a character that matches your vision.
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border rounded-md mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/80 disabled:bg-gray-400"
            >
              {isLoading ? "Generating..." : "Generate Character"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}