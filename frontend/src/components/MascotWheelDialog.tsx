import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

const MASCOTS = [
  // ⚔️ MYTHICAL GODS/WARRIORS
  {
    id: "zeraphon",
    name: "Zeraphon",
    emoji: "⚡",
    color: "#FFD700",
    description: "The Thunder God reborn as pure lightning. Commands storms with a single glance.",
    rarity: "Legendary",
    type: "Mythical",
    power: "Storm Control",
  },
  {
    id: "valkara",
    name: "Valkara",
    emoji: "🗡️",
    color: "#C0C0C0",
    description: "A warrior goddess who chose mortals over Olympus. Her blade splits mountains.",
    rarity: "Epic",
    type: "Mythical",
    power: "Unbreakable Will",
  },
  {
    id: "solmaar",
    name: "Solmaar",
    emoji: "☀️",
    color: "#FF8C00",
    description: "Ancient sun deity trapped in mortal form. Still burns brighter than a thousand stars.",
    rarity: "Legendary",
    type: "Mythical",
    power: "Solar Flare",
  },
  {
    id: "krython",
    name: "Krython",
    emoji: "🔱",
    color: "#4169E1",
    description: "God of the deep seas. The ocean bends to his will. Feared by sailors across all worlds.",
    rarity: "Epic",
    type: "Mythical",
    power: "Tidal Force",
  },
  {
    id: "nyxara",
    name: "Nyxara",
    emoji: "🌑",
    color: "#9370DB",
    description: "Goddess of shadows and secrets. Walks between worlds unseen.",
    rarity: "Rare",
    type: "Mythical",
    power: "Shadow Step",
  },
  {
    id: "thornblade",
    name: "Thornblade",
    emoji: "🛡️",
    color: "#228B22",
    description: "An immortal warrior covered in living armor. Has never lost a battle in 3000 years.",
    rarity: "Rare",
    type: "Mythical",
    power: "Iron Fortitude",
  },
  // 🐉 FANTASY CREATURES
  {
    id: "embervex",
    name: "Embervex",
    emoji: "🐲",
    color: "#FF4500",
    description: "An ancient fire dragon who sleeps in volcanos. Wakes only when destiny calls.",
    rarity: "Legendary",
    type: "Fantasy",
    power: "Inferno Breath",
  },
  {
    id: "lumicorn",
    name: "Lumicorn",
    emoji: "🦄",
    color: "#FF69B4",
    description: "A unicorn born from a dying star. Its horn can heal any wound or break any curse.",
    rarity: "Epic",
    type: "Fantasy",
    power: "Starlight Heal",
  },
  {
    id: "frostwing",
    name: "Frostwing",
    emoji: "🦋",
    color: "#87CEEB",
    description: "A butterfly the size of a house. Every wingbeat freezes time for a split second.",
    rarity: "Rare",
    type: "Fantasy",
    power: "Time Freeze",
  },
  {
    id: "grimmoth",
    name: "Grimmoth",
    emoji: "🦇",
    color: "#800080",
    description: "A shadow phoenix that rises from darkness instead of fire. Feeds on nightmares.",
    rarity: "Epic",
    type: "Fantasy",
    power: "Dark Rebirth",
  },
  {
    id: "stoneback",
    name: "Stoneback",
    emoji: "🐢",
    color: "#8B7355",
    description: "An ancient turtle carrying an entire civilization on its back. Older than memory.",
    rarity: "Common",
    type: "Fantasy",
    power: "Ancient Wisdom",
  },
  {
    id: "glimmerfang",
    name: "Glimmerfang",
    emoji: "🦊",
    color: "#FF6347",
    description: "A nine-tailed fox made of living fire and starlight. Grants wishes to the worthy.",
    rarity: "Legendary",
    type: "Fantasy",
    power: "Wish Granting",
  },
  {
    id: "coralspine",
    name: "Coralspine",
    emoji: "🐉",
    color: "#20B2AA",
    description: "A sea dragon who guards sunken kingdoms. Made of living coral and ocean magic.",
    rarity: "Rare",
    type: "Fantasy",
    power: "Ocean Armor",
  },
  {
    id: "woolveil",
    name: "Woolveil",
    emoji: "🐑",
    color: "#E8E8E8",
    description: "Looks completely harmless. Actually a dimension-hopping creature of immense power.",
    rarity: "Common",
    type: "Fantasy",
    power: "Deception",
  },
  // 🌌 SPACE CREATURES
  {
    id: "nebulon",
    name: "Nebulon",
    emoji: "👾",
    color: "#7B68EE",
    description: "Born inside a dying nebula. Its body contains an entire galaxy in miniature.",
    rarity: "Legendary",
    type: "Space",
    power: "Galaxy Core",
  },
  {
    id: "voidcrawler",
    name: "Voidcrawler",
    emoji: "🕷️",
    color: "#2F4F4F",
    description: "Lives in the void between galaxies. Has never been fully observed — too fast.",
    rarity: "Epic",
    type: "Space",
    power: "Void Speed",
  },
  {
    id: "pulsarfin",
    name: "Pulsarfin",
    emoji: "🐬",
    color: "#00CED1",
    description: "A cosmic dolphin that surfs pulsar waves. Its songs can be heard across star systems.",
    rarity: "Rare",
    type: "Space",
    power: "Pulsar Song",
  },
  {
    id: "asterix",
    name: "Asterix",
    emoji: "☄️",
    color: "#FF8C69",
    description: "A living asteroid with a face. Crashed into Earth 10,000 years ago and decided to stay.",
    rarity: "Common",
    type: "Space",
    power: "Impact Force",
  },
  {
    id: "quantumflea",
    name: "Quantumflea",
    emoji: "🔮",
    color: "#DA70D6",
    description: "Exists in multiple dimensions simultaneously. Never quite where you think it is.",
    rarity: "Epic",
    type: "Space",
    power: "Quantum Shift",
  },
  {
    id: "solarius",
    name: "Solarius",
    emoji: "🌟",
    color: "#FFD700",
    description: "A being made entirely of concentrated starlight. Older than the universe itself.",
    rarity: "Legendary",
    type: "Space",
    power: "Stellar Genesis",
  },
  {
    id: "driftmoss",
    name: "Driftmoss",
    emoji: "🌿",
    color: "#90EE90",
    description: "A plant creature that drifted through space for millennia. Grew wise from the silence.",
    rarity: "Common",
    type: "Space",
    power: "Cosmic Growth",
  },
];

const rarityColors: Record<string, string> = {
  Common: "text-zinc-400",
  Rare: "text-blue-400",
  Epic: "text-purple-400",
  Legendary: "text-yellow-400",
};

const rarityGlow: Record<string, string> = {
  Common: "",
  Rare: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
  Epic: "shadow-[0_0_30px_rgba(168,85,247,0.5)]",
  Legendary: "shadow-[0_0_30px_rgba(234,179,8,0.8)]",
};

interface MascotWheelDialogProps {
  onComplete: (mascot: string) => void;
}

export const MascotWheelDialog = ({ onComplete }: MascotWheelDialogProps) => {
  const [spinning, setSpinning] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selectedMascot, setSelectedMascot] = useState<typeof MASCOTS[0] | null>(null);
  const [displayIndex, setDisplayIndex] = useState(0);

  useEffect(() => {
    if (!spinning) return;
    const interval = setInterval(() => {
      setDisplayIndex((prev) => (prev + 1) % MASCOTS.length);
    }, 80);
    return () => clearInterval(interval);
  }, [spinning]);

  const handleSpin = () => {
    if (spinning || revealed) return;
    setSpinning(true);

    // Weighted rarity
    const roll = Math.random() * 100;
    let mascot;
    if (roll < 50) {
      const pool = MASCOTS.filter((m) => m.rarity === "Common");
      mascot = pool[Math.floor(Math.random() * pool.length)];
    } else if (roll < 80) {
      const pool = MASCOTS.filter((m) => m.rarity === "Rare");
      mascot = pool[Math.floor(Math.random() * pool.length)];
    } else if (roll < 95) {
      const pool = MASCOTS.filter((m) => m.rarity === "Epic");
      mascot = pool[Math.floor(Math.random() * pool.length)];
    } else {
      const pool = MASCOTS.filter((m) => m.rarity === "Legendary");
      mascot = pool[Math.floor(Math.random() * pool.length)];
    }

    setTimeout(() => {
      setSpinning(false);
      setSelectedMascot(mascot);
      setRevealed(true);

      if (mascot.rarity === "Legendary") {
        toast("🌟 LEGENDARY! You got an incredible mascot!", { icon: "🎉" });
      } else if (mascot.rarity === "Epic") {
        toast("✨ EPIC pull! Amazing!", { icon: "🎊" });
      } else if (mascot.rarity === "Rare") {
        toast("💎 RARE! Nice pull!", { icon: "⭐" });
      } else {
        toast("You got a mascot companion!", { icon: "🎵" });
      }
    }, 3000);
  };

  const handleClaim = () => {
    if (!selectedMascot) return;
    onComplete(selectedMascot.id);
  };

  return (
    <div className='fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className='bg-zinc-900 border border-zinc-700 rounded-2xl p-8 max-w-md w-full text-center'
      >
        {/* Header */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className='mb-6'
        >
          <h1 className='text-3xl font-bold text-white mb-2'>
            Welcome! 🎉
          </h1>
          <p className='text-zinc-400 text-sm'>
            Spin to discover your permanent companion!
          </p>
        </motion.div>

        {/* Display */}
        <div className='relative mb-8 flex items-center justify-center'>
          <AnimatePresence mode='wait'>
            {!revealed ? (
              <motion.div
                key='spinner'
                className='w-40 h-40 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-zinc-800'
                animate={spinning ? { rotate: 360 } : {}}
                transition={spinning ? { repeat: Infinity, duration: 0.5, ease: "linear" } : {}}
                style={{ fontSize: "5rem" }}
              >
                {spinning ? MASCOTS[displayIndex].emoji : "❓"}
              </motion.div>
            ) : (
              <motion.div
                key='revealed'
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className={`w-40 h-40 rounded-full border-4 flex items-center justify-center bg-zinc-800 ${rarityGlow[selectedMascot?.rarity || "Common"]}`}
                style={{
                  borderColor: selectedMascot?.color,
                  fontSize: "5rem",
                }}
              >
                {selectedMascot?.emoji}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Particles */}
          {spinning && (
            <div className='absolute inset-0 flex items-center justify-center pointer-events-none'>
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className='absolute w-2 h-2 rounded-full bg-emerald-500'
                  animate={{
                    x: Math.cos((i / 8) * Math.PI * 2) * 90,
                    y: Math.sin((i / 8) * Math.PI * 2) * 90,
                    opacity: [1, 0],
                  }}
                  transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Mascot info */}
        {revealed && selectedMascot && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='mb-6'
          >
            <div className='flex justify-center gap-2 mb-2'>
              <span className='text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300'>
                {selectedMascot.type}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${rarityColors[selectedMascot.rarity]}`}>
                ✦ {selectedMascot.rarity}
              </span>
            </div>

            <h2 className='text-2xl font-bold text-white mb-1'>
              {selectedMascot.name}
            </h2>

            <p className='text-zinc-400 text-sm mt-2 mb-3'>
              {selectedMascot.description}
            </p>

            <div
              className='inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold text-black'
              style={{ backgroundColor: selectedMascot.color }}
            >
              ⚡ Power: {selectedMascot.power}
            </div>
          </motion.div>
        )}

        {/* Buttons */}
        {!revealed ? (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSpin}
            disabled={spinning}
            className='w-full py-4 rounded-xl font-bold text-lg bg-emerald-500 hover:bg-emerald-400 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {spinning ? "Spinning..." : "🎰 Spin!"}
          </motion.button>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClaim}
            className='w-full py-4 rounded-xl font-bold text-lg text-black transition-colors'
            style={{ backgroundColor: selectedMascot?.color }}
          >
            Claim {selectedMascot?.name}! 🎉
          </motion.button>
        )}

        {/* Rarity legend */}
        {!revealed && !spinning && (
          <div className='mt-4 flex justify-center gap-4 text-xs'>
            <span className='text-zinc-400'>Common</span>
            <span className='text-blue-400'>Rare</span>
            <span className='text-purple-400'>Epic</span>
            <span className='text-yellow-400'>Legendary</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};