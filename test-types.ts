// Test file to check our TypeScript fixes

// Simulate the character data structure
const characterData = {
  name: "",
  characterClass: "",
  primaryGenre: "fantasy",
  secondaryGenres: [] as string[],
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
  skills: [] as string[],
};

// Test the problematic code patterns we fixed
const testHandleChange = (name: string, value: string) => {
  if (name.includes(".")) {
    const [parent, child] = name.split(".");
    const newData = {
      ...characterData,
      [parent]: {
        ...(characterData[parent as keyof typeof characterData] as any),
        [child]: value,
      },
    };
    console.log(newData);
  } else {
    const newData = {
      ...characterData,
      [name as keyof typeof characterData]: value,
    };
    console.log(newData);
  }
};

const testAttributeChange = (attribute: string, value: string) => {
  const newData = {
    ...characterData,
    attributes: {
      ...characterData.attributes,
      [attribute as keyof typeof characterData.attributes]: parseInt(value),
    },
  };
  console.log(newData);
};

// Test CHARACTER_CLASSES access
const CHARACTER_CLASSES = {
  fantasy: ["Warrior", "Mage"],
  modern: ["Detective", "Doctor"],
};

const testClassAccess = (genre: string) => {
  return CHARACTER_CLASSES[genre as keyof typeof CHARACTER_CLASSES];
};

console.log("TypeScript fixes test completed successfully!");
