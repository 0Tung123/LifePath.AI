"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CharacterCreation from "@/components/game/CharacterCreation";

const CreateCharacterPage = () => {
  const router = useRouter();

  const handleCharacterCreated = (characterId: string) => {
    // Redirect to the characters page after creating a character
    router.push("/game/characters");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tạo nhân vật mới</h1>
          <Link
            href="/game/characters"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition duration-300"
          >
            Quay lại
          </Link>
        </div>

        <CharacterCreation onCharacterCreated={handleCharacterCreated} />
      </div>
    </div>
  );
};

export default CreateCharacterPage;
