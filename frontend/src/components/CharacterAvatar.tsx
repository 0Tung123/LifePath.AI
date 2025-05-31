"use client";

import { useMemo } from "react";

interface CharacterAvatarProps {
  character: {
    name: string;
    primaryGenre: string;
    characterClass?: string;
    level?: number;
  };
  size?: "sm" | "md" | "lg" | "xl";
  showInfo?: boolean;
}

export default function CharacterAvatar({
  character,
  size = "md",
  showInfo = false,
}: CharacterAvatarProps) {
  // Xác định màu nền dựa trên thể loại
  const getGenreGradient = (genre: string) => {
    const gradients = {
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

    return (
      gradients[genre as keyof typeof gradients] ||
      "from-blue-600 to-purple-600"
    );
  };

  // Xác định kích thước avatar
  const sizeClasses = useMemo(() => {
    switch (size) {
      case "sm":
        return {
          container: "w-10 h-10",
          text: "text-lg",
          infoText: "text-xs",
        };
      case "md":
        return {
          container: "w-16 h-16",
          text: "text-2xl",
          infoText: "text-sm",
        };
      case "lg":
        return {
          container: "w-24 h-24",
          text: "text-4xl",
          infoText: "text-base",
        };
      case "xl":
        return {
          container: "w-32 h-32",
          text: "text-5xl",
          infoText: "text-lg",
        };
      default:
        return {
          container: "w-16 h-16",
          text: "text-2xl",
          infoText: "text-sm",
        };
    }
  }, [size]);

  return (
    <div className="flex flex-col items-center">
      <div
        className={`${
          sizeClasses.container
        } rounded-full bg-gradient-to-br ${getGenreGradient(
          character.primaryGenre
        )} flex items-center justify-center shadow-lg`}
      >
        <span className={`${sizeClasses.text} font-bold text-white`}>
          {character.name.charAt(0)}
        </span>
      </div>

      {showInfo && (
        <div className="mt-2 text-center">
          <div className="font-medium">{character.name}</div>
          {character.characterClass && character.level && (
            <div className={`${sizeClasses.infoText} text-gray-400`}>
              {character.characterClass} • Cấp {character.level}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
