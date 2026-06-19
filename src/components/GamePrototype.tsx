"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { BarChart3, ChevronLeft, ChevronRight, Crown, Gift, Hand, Home, Medal, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Screen = "welcome" | "name" | "rules" | "avatar" | "hub" | "intro" | "score" | "leaderboard" | "reward" | "hallOfFame" | "profile";
type GameKey = "fridge" | "plating" | "jukebox" | "order";
type StatKey = "organisation" | "sympathie" | "rapidite" | "precision" | "ambiance";

type AvatarState = {
  skin: string;
  hair: string;
  shirt: string;
  apron: string;
  hat: string;
  accessory: string;
  badge: string;
};

type PlayerState = {
  name: string;
  avatar: AvatarState;
  weeklyStats: PlayerStats;
  history: PlayerHistory;
  dailyAttempts: DailyAttempts;
  seenTutorials: Record<string, boolean>;
  lastGame?: GameKey;
};

type PlayerStats = Record<StatKey, number>;

type DailyAttempts = Record<GameKey, string>;

type PlayerHistory = {
  weeksPlayed: number;
  victories: number;
  totalGamesPlayed: number;
  rewardsClaimed: number;
};

type Direction = {
  x: number;
  y: number;
};

type StagePosition = {
  x: number;
  y: number;
};

type StageSize = {
  width: number;
  height: number;
};

type HubHotspot = {
  key: string;
  game: GameKey;
  className: string;
  icon: string;
  label: string;
  interaction: {
    x: number;
    y: number;
  };
};

const defaultPlayer: PlayerState = {
  name: "",
  avatar: {
    skin: "#c98a58",
    hair: "#a94725",
    shirt: "#f1eee2",
    apron: "#e3a92f",
    hat: "none",
    accessory: "none",
    badge: "none"
  },
  weeklyStats: {
    organisation: 0,
    sympathie: 0,
    rapidite: 0,
    precision: 0,
    ambiance: 0
  },
  history: {
    weeksPlayed: 1,
    victories: 0,
    totalGamesPlayed: 0,
    rewardsClaimed: 0
  },
  dailyAttempts: {
    fridge: "",
    plating: "",
    jukebox: "",
    order: ""
  },
  seenTutorials: {}
};

const games: Record<
  GameKey,
  {
    title: string;
    label: string;
    statGains: Partial<PlayerStats>;
    icon: string;
    steps: [string, string, string];
  }
> = {
  fridge: {
    title: "Frigo",
    label: "FRIGO",
    statGains: { organisation: 25 },
    icon: "▤",
    steps: ["Repere l'intrus", "Range les bons produits", "Garde le frigo clean"]
  },
  plating: {
    title: "Plating",
    label: "COMPO",
    statGains: { rapidite: 15, precision: 15 },
    icon: "◉",
    steps: ["Lis le ticket", "Glisse les bons items", "Evite les leurres"]
  },
  jukebox: {
    title: "Jukebox",
    label: "MUSIQUE",
    statGains: { ambiance: 25 },
    icon: "♪",
    steps: ["Observe la salle", "Choisis le bon mood", "Garde les clients contents"]
  },
  order: {
    title: "Commande",
    label: "CLIENT",
    statGains: { sympathie: 25 },
    icon: "…",
    steps: ["Ecoute le client", "Verifie sa fiche", "Conseille sans erreur"]
  }
};

const avatarOptions: Record<keyof AvatarState, string[]> = {
  skin: ["#f2c996", "#c98a58", "#8c5635", "#5b8d3f", "#e0aa45"],
  hair: ["#5a2f1d", "#a94725", "#d7a33b", "#24201d", "#c8589c"],
  shirt: ["#f1eee2", "#c4432d", "#334e9b", "#5c8f2e", "#28211d"],
  apron: ["#e3a92f", "#7aab3f", "#cf5734", "#ece2c6", "#344f64"],
  hat: ["none", "chef", "cap", "bandana", "crown"],
  accessory: ["none", "shades", "headphones", "mustache", "blush"],
  badge: ["none", "star", "burger", "nugget"]
};

const categoryLabels: Record<keyof AvatarState, string> = {
  skin: "Peau",
  hair: "Cheveux",
  shirt: "Tenue",
  apron: "Tablier",
  hat: "Couvre-chef",
  accessory: "Accessoire",
  badge: "Badge"
};

const optionLabels: Record<string, string> = {
  none: "Aucun",
  chef: "Chef",
  cap: "Képi",
  bandana: "Bandana",
  crown: "Couronne",
  shades: "Shades",
  headphones: "Casque",
  mustache: "Moustache",
  blush: "Joues",
  star: "Étoile",
  burger: "Burger",
  nugget: "Nugget"
};

const statLabels: Record<StatKey, string> = {
  organisation: "Organisation",
  sympathie: "Sympathie",
  rapidite: "Rapidite",
  precision: "Precision",
  ambiance: "Ambiance"
};

const statOrder: StatKey[] = ["organisation", "sympathie", "rapidite", "precision", "ambiance"];

const ranks = [
  { name: "CrispyKing", score: 428, avatar: { ...defaultPlayer.avatar, hair: "#d7a33b", apron: "#cf5734", badge: "star" } },
  { name: "NuggetBoss", score: 391, avatar: { ...defaultPlayer.avatar, skin: "#f2c996", hair: "#24201d", apron: "#e3a92f", badge: "nugget" } },
  { name: "KetchupMaster", score: 372, avatar: { ...defaultPlayer.avatar, skin: "#8c5635", hair: "#a94725", apron: "#c4432d", badge: "burger" } },
  { name: "SauceRunner", score: 336, avatar: { ...defaultPlayer.avatar, shirt: "#334e9b", apron: "#7aab3f", accessory: "headphones" } }
];

const hallOfFameEntries = [
  { week: 24, champion: "CrispyKing", prize: "Baby Burger" },
  { week: 25, champion: "NuggetBoss", prize: "Baby Burger" },
  { week: 26, champion: "KetchupMaster", prize: "Baby Burger" }
];

const hubHotspots: HubHotspot[] = [
  {
    key: "fridge",
    game: "fridge",
    className: "fridge",
    icon: "▤",
    label: "Ranger le frigo",
    interaction: { x: 0.12, y: 0.75 }
  },
  {
    key: "prep",
    game: "plating",
    className: "prep",
    icon: "◉",
    label: "Composer l'assiette",
    interaction: { x: 0.35, y: 0.75 }
  },
  {
    key: "music",
    game: "jukebox",
    className: "music",
    icon: "♪",
    label: "Changer la musique",
    interaction: { x: 0.60, y: 0.75 }
  },
  {
    key: "talk",
    game: "order",
    className: "talk",
    icon: "…",
    label: "Prendre commande",
    interaction: { x: 0.86, y: 0.75 }
  }
];


function readPlayer(): PlayerState {
  if (typeof window === "undefined") return defaultPlayer;
  const raw = window.localStorage.getItem("buck-crew-next");
  if (!raw) return defaultPlayer;
  try {
    const parsed = JSON.parse(raw);
    return migratePlayer(parsed);
  } catch {
    return defaultPlayer;
  }
}

function migratePlayer(parsed: Partial<PlayerState> & { score?: number; nuggets?: number; attempts?: number }): PlayerState {
  const legacyScore = typeof parsed.score === "number" ? parsed.score : 0;
  const legacyTotal = Math.min(450, Math.max(0, legacyScore));
  const legacyStats: PlayerStats = {
    organisation: Math.round(legacyTotal * 0.24),
    sympathie: Math.round(legacyTotal * 0.22),
    rapidite: Math.round(legacyTotal * 0.18),
    precision: Math.round(legacyTotal * 0.2),
    ambiance: Math.round(legacyTotal * 0.16)
  };

  return {
    ...defaultPlayer,
    ...parsed,
    name: parsed.name || "",
    avatar: {
      ...defaultPlayer.avatar,
      ...(parsed.avatar || {})
    },
    weeklyStats: {
      ...(parsed.weeklyStats ? defaultPlayer.weeklyStats : legacyStats),
      ...(parsed.weeklyStats || {})
    },
    history: {
      ...defaultPlayer.history,
      ...(parsed.history || {}),
      totalGamesPlayed: parsed.history?.totalGamesPlayed ?? (parsed.lastGame ? 1 : 0)
    },
    dailyAttempts: {
      ...defaultPlayer.dailyAttempts,
      ...(parsed.dailyAttempts || {})
    },
    seenTutorials: {
      ...(parsed.seenTutorials || {})
    },
    lastGame: parsed.lastGame
  };
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getNextSaturdayLabel() {
  const now = new Date();
  const target = new Date(now);
  const daysUntilSaturday = (6 - now.getDay() + 7) % 7;
  target.setDate(now.getDate() + daysUntilSaturday);
  target.setHours(18, 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 7);
  const diff = target.getTime() - now.getTime();
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.max(0, Math.ceil((diff % 86_400_000) / 3_600_000));
  if (days <= 0) return `${hours}h`;
  return `${days}j ${hours}h`;
}

function getWeeklyScore(player: PlayerState) {
  return statOrder.reduce((total, key) => total + (player.weeklyStats[key] || 0), 0);
}

function isGameDoneToday(player: PlayerState, game: GameKey, today = getTodayKey()) {
  return player.dailyAttempts[game] === today;
}

function areAllGamesDoneToday(player: PlayerState, today = getTodayKey()) {
  return (Object.keys(games) as GameKey[]).every((game) => isGameDoneToday(player, game, today));
}

function formatStatGains(gains: Partial<PlayerStats>) {
  return statOrder
    .filter((key) => gains[key])
    .map((key) => `+${gains[key]} ${statLabels[key]}`)
    .join(" / ");
}

function applyStatGains(stats: PlayerStats, gains: Partial<PlayerStats>): PlayerStats {
  return {
    ...stats,
    ...Object.fromEntries(
      statOrder.map((key) => [key, Math.min(999, (stats[key] || 0) + (gains[key] || 0))])
    )
  } as PlayerStats;
}

function savePlayer(player: PlayerState) {
  window.localStorage.setItem("buck-crew-next", JSON.stringify(player));
}

function freshPlayer(): PlayerState {
  return {
    ...defaultPlayer,
      avatar: {
        ...defaultPlayer.avatar
      },
    weeklyStats: { ...defaultPlayer.weeklyStats },
    history: { ...defaultPlayer.history },
    dailyAttempts: { ...defaultPlayer.dailyAttempts },
    seenTutorials: {}
  };
}

function shadeColor(color: string, percent: number) {
  if (!color || !color.startsWith("#")) return color;
  const num = parseInt(color.slice(1), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  const rHex = Math.max(0, Math.min(255, R)).toString(16).padStart(2, "0");
  const gHex = Math.max(0, Math.min(255, G)).toString(16).padStart(2, "0");
  const bHex = Math.max(0, Math.min(255, B)).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}`;
}

function Avatar({ avatar, size = "medium" }: { avatar: AvatarState; size?: "tiny" | "medium" | "large" | "stage" }) {
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);

  const skin = avatar.skin || "#c98a58";
  const skinShadow = shadeColor(skin, -16);
  const hair = avatar.hair || "#a94725";
  const hairShadow = shadeColor(hair, -18);
  const shirt = avatar.shirt || "#f1eee2";
  const shirtShadow = shadeColor(shirt, -16);
  const apron = avatar.apron || "#e3a92f";
  const apronShadow = shadeColor(apron, -16);

  const colorMap: Record<string, string> = {
    O: "#150d08",
    S: skin,
    s: skinShadow,
    H: hair,
    h: hairShadow,
    C: shirt,
    c: shirtShadow,
    A: apron,
    a: apronShadow,
    W: "#ffffff",
    E: "#150d08",
    G: "#cbd5e1",
    g: "#94a3b8",
    P: "#2b2520",
    K: "#0f172a",
    R: "#ef4444",
    r: "#b91c1c",
    Y: "#fbbf24",
    y: "#d97706",
    B: "#3b82f6",
    b: "#1d4ed8",
    F: "#f472b6"
  };

  let pixelCounter = 0;

  function drawSprite(
    xStart: number,
    yStart: number,
    grid: string[],
    map: Record<string, string>
  ) {
    const rects: React.ReactNode[] = [];
    grid.forEach((row, dy) => {
      for (let dx = 0; dx < row.length; dx++) {
        const char = row[dx];
        if (char !== " " && char !== ".") {
          const color = map[char];
          if (color) {
            rects.push(
              <rect
                key={pixelCounter++}
                x={xStart + dx}
                y={yStart + dy}
                width={1}
                height={1}
                fill={color}
                shapeRendering="crispEdges"
              />
            );
          }
        }
      }
    });
    return rects;
  }

  const layers: React.ReactNode[] = [];

  // 1. Back Hair (if not covered by chef hat or crown)
  if (avatar.hat !== "chef" && avatar.hat !== "crown") {
    const hairBackGrid = [
      "   OOOOOOOO   ",
      "  OHHHHHHHHO  ",
      " OHHHHHHHHHHO ",
      "OHHHHHHHHHHHHO",
      "OHH        HHO",
      "OHH        HHO",
      "OHH        HHO",
      "OHh        hHO",
      "OOh        hOO",
      " OO        OO "
    ];
    layers.push(...drawSprite(5, 5, hairBackGrid, colorMap));
  }

  // 2. Legs & Shoes
  const legsGrid = [
    "  OOOO   OOOO  ",
    "  OPPO   OPPO  ",
    " OOPPO  OOPPO  ",
    "OKKKO   OKKKO  "
  ];
  layers.push(...drawSprite(5, 28, legsGrid, colorMap));

  // 3. Shirt & Arms
  const shirtGrid = [
    "    OOOOOOOO    ",
    "  OOOCCCCCCCOOO ",
    " OOO CCCCCCC OOO",
    "OO  CCCCCCCCC  OO",
    "OO  CCCCCCCCC  OO",
    "OS  CCCCCCCCC  SO",
    "OS  ccCcccCcc  SO",
    " O  ccCcccCcc  O ",
    "    ccCcccCcc    ",
    "    OOOOOOOOO    "
  ];
  layers.push(...drawSprite(4, 18, shirtGrid, colorMap));

  // 4. Apron
  const apronGrid = [
    "    O      O    ",
    "    OA    AO    ",
    "    OAAAAAAO    ",
    "    OAAAAAAO    ",
    "    OAAAAAAO    ",
    "    OAAAAAAO    ",
    "    OAAAAAAO    ",
    "    OaaaaaaO    ",
    "    OaaaaaaO    ",
    "    OOOOOOOO    "
  ];
  layers.push(...drawSprite(4, 18, apronGrid, colorMap));

  // 5. Head (Skin)
  const eyesRow = blink ? "OSSSSSSSSSSO" : "OSSWESSEWSSO";
  const headGrid = [
    "  OOOOOOOO  ",
    " OSSSSSSSSO ",
    "OSSSSSSSSSSO",
    eyesRow,
    "OSSSSSSSSSSO",
    "OSSSSSSSSSSO",
    "OSSSSSSSSSSO",
    "OSSSOOOOOSSO",
    " OSSSSSSSSO ",
    "  OssSSsSS  ",
    "   OOOOOO   "
  ];
  layers.push(...drawSprite(6, 8, headGrid, colorMap));

  // 6. Badge/Pin on apron
  if (avatar.badge === "star") {
    const starGrid = [
      " Y ",
      "YYY",
      " Y "
    ];
    layers.push(...drawSprite(11, 22, starGrid, colorMap));
  } else if (avatar.badge === "burger") {
    const burgerGrid = [
      " R ",
      "GYG",
      " O "
    ];
    layers.push(...drawSprite(11, 22, burgerGrid, colorMap));
  } else if (avatar.badge === "nugget") {
    const nuggetGrid = [
      " y ",
      "yyy",
      " y "
    ];
    layers.push(...drawSprite(11, 22, nuggetGrid, colorMap));
  }

  // 7. Accessories
  if (avatar.accessory === "shades") {
    const shadesGrid = [
      "OOOOOOOOOO",
      "OOWOOOWOOO"
    ];
    layers.push(...drawSprite(7, 11, shadesGrid, colorMap));
  } else if (avatar.accessory === "headphones") {
    const bandGrid = [
      " OOOOOOOO ",
      "OOOOOOOOOO"
    ];
    layers.push(...drawSprite(7, 6, bandGrid, colorMap));
    const cupLeftGrid = [
      "OO",
      "RR",
      "RR",
      "OO"
    ];
    const cupRightGrid = [
      "OO",
      "RR",
      "RR",
      "OO"
    ];
    layers.push(...drawSprite(5, 9, cupLeftGrid, colorMap));
    layers.push(...drawSprite(17, 9, cupRightGrid, colorMap));
  } else if (avatar.accessory === "mustache") {
    const mustacheGrid = [
      "OOOOOO"
    ];
    layers.push(...drawSprite(9, 14, mustacheGrid, colorMap));
  } else if (avatar.accessory === "blush") {
    const blushLeft = ["F"];
    const blushRight = ["F"];
    layers.push(...drawSprite(7, 13, blushLeft, colorMap));
    layers.push(...drawSprite(16, 13, blushRight, colorMap));
  }

  // 8. Hat (over the head/hair)
  if (avatar.hat === "chef") {
    const chefHatGrid = [
      "    GGWWWW    ",
      "  GGGGWWWWWW  ",
      " GGGGGWWWWWWW ",
      "GGGGGWWWWWWWWW",
      "GGGGGWWWWWWWWW",
      " GGGGGWWWWWWW ",
      "  GGGGWWWWWW  ",
      "   GGGGGGGG   ",
      "   OOOOOOOO   "
    ];
    layers.push(...drawSprite(5, 0, chefHatGrid, colorMap));
  } else if (avatar.hat === "cap") {
    const capGrid = [
      "   rrRRRR     ",
      "  rrrrRRRR    ",
      " rrrrRRRRRR   ",
      "rrrrrrRRRRRR  ",
      "OOOOOOOOOOOOO "
    ];
    layers.push(...drawSprite(5, 4, capGrid, colorMap));
  } else if (avatar.hat === "bandana") {
    const bandanaGrid = [
      " OOOOOOOOOO ",
      "OBBBBBBBBBBO",
      "OBbbBbbbBbBO",
      " OOOOOOOOOO "
    ];
    layers.push(...drawSprite(6, 6, bandanaGrid, colorMap));
    const knotGrid = [
      "b",
      "b"
    ];
    layers.push(...drawSprite(5, 8, knotGrid, colorMap));
  } else if (avatar.hat === "crown") {
    const crownGrid = [
      " O  O  O  O ",
      " OY OY OY O ",
      " OYROYBOYRO ",
      " OYYYYYYYYO ",
      " OyyyyyyyyO ",
      " OOOOOOOOOO "
    ];
    layers.push(...drawSprite(6, 3, crownGrid, colorMap));
  }

  return (
    <div className={`avatar avatar-${size}`} aria-hidden="true">
      <svg viewBox="0 0 24 32" style={{ width: "100%", height: "100%", display: "block" }}>
        {layers}
      </svg>
    </div>
  );
}

function PixelIcon({ type, children }: { type?: string; children?: React.ReactNode }) {
  return (
    <span className={`pixel-icon ${type || ""}`}>
      <i>{children}</i>
    </span>
  );
}

function Frame({
  step,
  title,
  children,
  className = ""
}: {
  step: number;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.section
      className="screen"
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.98 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
    >
      <div className={`pixel-frame ${className}`}>
        <header className="frame-header">
          <span className="step-badge">{step}</span>
          <h1>{title}</h1>
        </header>
        <div className="frame-content">{children}</div>
      </div>
    </motion.section>
  );
}

function MainButton({
  children,
  onClick,
  type = "button",
  className = ""
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <motion.button className={`main-button ${className}`} whileTap={{ scale: 0.96, y: 4 }} type={type} onClick={onClick}>
      {children}
    </motion.button>
  );
}

function Hud({ player, onNavigate }: { player: PlayerState; onNavigate: (screen: Screen) => void }) {
  const weeklyScore = getWeeklyScore(player);
  const doneToday = (Object.keys(games) as GameKey[]).filter((game) => isGameDoneToday(player, game)).length;

  return (
    <header className="hud">
      <button className="hud-cell" onClick={() => onNavigate("profile")} type="button">
        <PixelIcon type="star">★</PixelIcon>
        <strong>{weeklyScore.toLocaleString("fr-FR")}</strong>
      </button>
      <button className="hud-cell hud-wide" onClick={() => onNavigate("leaderboard")} type="button">
        <PixelIcon type="calendar">▣</PixelIcon>
        <span>Classement<br />semaine</span>
      </button>
      <button className="hud-cell" onClick={() => onNavigate("reward")} type="button">
        <Gift size={30} />
        <strong>Samedi</strong>
      </button>
      <button className="hud-cell heart-cell" onClick={() => onNavigate("hallOfFame")} type="button">
        <span>{doneToday}/4</span>
        <small>Defis jour</small>
      </button>
    </header>
  );
}

function RouteMap() {
  const route = [
    ["fridge", "Frigo"],
    ["plate", "Compo"],
    ["chef", "Cuisine"],
    ["register", "Comptoir"],
    ["table", "Salle"],
    ["door", "Entree"]
  ];

  return (
    <nav className="route-map" aria-label="Plan du restaurant">
      {route.map(([asset, label], index) => (
        <button className={label === "Salle" ? "active" : ""} key={label}>
          <span><img src={`/assets/hub/nav-${asset}.png`} alt="" /></span>
          <small>{label}</small>
          {index < route.length - 1 && <i />}
        </button>
      ))}
    </nav>
  );
}

function Joystick({ onMove, onRelease }: { onMove: (direction: Direction) => void; onRelease: () => void }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const bind = useDrag(
    ({ down, movement: [mx, my] }) => {
      if (!down) {
        setOffset({ x: 0, y: 0 });
        onMove({ x: 0, y: 0 });
        onRelease();
        return;
      }
      const length = Math.max(1, Math.hypot(mx, my));
      const limit = Math.min(34, length);
      setOffset({ x: (mx / length) * limit, y: (my / length) * limit });
      onMove({ x: mx / length, y: my / length });
    },
    { pointer: { touch: true } }
  );

  return (
    <div className="joystick" {...bind()}>
      <ChevronLeft className="joy-left" size={28} />
      <ChevronRight className="joy-right" size={28} />
      <motion.span animate={{ x: offset.x, y: offset.y }} transition={{ type: "spring", stiffness: 450, damping: 28 }} />
    </div>
  );
}

function StatBars({ stats }: { stats: PlayerStats }) {
  return (
    <div className="stats-list">
      {statOrder.map((key) => {
        const value = stats[key] || 0;
        const filled = Math.min(10, Math.round(value / 10));
        return (
          <div className="stat-row" key={key}>
            <span>{statLabels[key]}</span>
            <i aria-hidden="true">{"█".repeat(filled)}{"░".repeat(10 - filled)}</i>
            <b>{value}</b>
          </div>
        );
      })}
    </div>
  );
}

function MetaNav({ onNavigate }: { onNavigate: (screen: Screen) => void }) {
  return (
    <div className="meta-nav">
      <button onClick={() => onNavigate("hub")} type="button"><Home size={18} />Resto</button>
      <button onClick={() => onNavigate("leaderboard")} type="button"><Trophy size={18} />Classement</button>
      <button onClick={() => onNavigate("profile")} type="button"><BarChart3 size={18} />Profil</button>
      <button onClick={() => onNavigate("reward")} type="button"><Gift size={18} />Samedi</button>
    </div>
  );
}

export function GamePrototype() {
  const stageRef = useRef<HTMLElement | null>(null);
  const directionRef = useRef<Direction>({ x: 0, y: 0 });
  const [screen, setScreen] = useState<Screen>("welcome");
  const [player, setPlayer] = useState<PlayerState>(defaultPlayer);
  const [selectedGame, setSelectedGame] = useState<GameKey>("plating");
  const [playerPosition, setPlayerPosition] = useState<StagePosition>({ x: 178, y: 386 });
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });
  const [toast, setToast] = useState("");
  const [blockedGame, setBlockedGame] = useState<GameKey | null>(null);

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    const saved = readPlayer();
    setPlayer(saved);
    if (saved.name) setScreen("hub");
  }, []);

  function updatePlayer(next: PlayerState) {
    setPlayer(next);
    savePlayer(next);
  }

  function resetUserFlow() {
    window.localStorage.removeItem("buck-crew-next");
    setSelectedGame("plating");
    setBlockedGame(null);
    setToast("");
    setPlayer(freshPlayer());
    setScreen("welcome");
  }

  function clampToFloor(next: StagePosition) {
    const stage = stageRef.current;
    if (!stage) return next;
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    return {
      x: Math.min(width - 42, Math.max(42, next.x)),
      y: Math.min(height - 12, Math.max(height * 0.68, next.y))
    };
  }

  function chooseGame(game: GameKey) {
    if (isGameDoneToday(player, game)) {
      setSelectedGame(game);
      setBlockedGame(game);
      setToast("Defi deja termine aujourd'hui.");
      window.setTimeout(() => setToast(""), 2400);
      return;
    }
    setBlockedGame(null);
    setSelectedGame(game);
    setScreen("intro");
  }

  const currentGame = games[selectedGame];

  const activeHotspot = useMemo(() => {
    if (!stageSize.width) return null;

    // Use X-only distance since the player always walks at floor level
    const activationRadius = stageSize.width * 0.12;
    let nearest: { hotspot: HubHotspot; distance: number } | null = null;

    for (const hotspot of hubHotspots) {
      const targetX = hotspot.interaction.x * stageSize.width;
      const distance = Math.abs(playerPosition.x - targetX);

      if (distance <= activationRadius && (!nearest || distance < nearest.distance)) {
        nearest = { hotspot, distance };
      }
    }

    return nearest?.hotspot ?? null;
  }, [playerPosition.x, stageSize.width]);

  const leaderboard = useMemo(() => {
    const current = {
      name: player.name || "PouletMaster",
      score: getWeeklyScore(player),
      avatar: player.avatar,
      isCurrent: true
    };
    return [...ranks.map((rank) => ({ ...rank, isCurrent: false })), current]
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [player]);

  const currentRank = useMemo(() => {
    const rows = [...ranks.map((rank) => ({ ...rank, isCurrent: false })), {
      name: player.name || "PouletMaster",
      score: getWeeklyScore(player),
      avatar: player.avatar,
      isCurrent: true
    }].sort((a, b) => b.score - a.score);
    return rows.findIndex((row) => row.isCurrent) + 1;
  }, [player]);

  const isChampion = currentRank === 1;
  const allDoneToday = areAllGamesDoneToday(player);

  useEffect(() => {
    if (screen !== "hub" || !stageRef.current) return;

    const stage = stageRef.current;
    const syncStageSize = () => {
      setStageSize({ width: stage.clientWidth, height: stage.clientHeight });
    };

    syncStageSize();
    const observer = new ResizeObserver(syncStageSize);
    observer.observe(stage);

    return () => observer.disconnect();
  }, [screen]);

  useEffect(() => {
    if (screen !== "hub") return;
    let frame = 0;
    let lastTime = performance.now();
    const speed = 140;

    const tick = (time: number) => {
      const delta = Math.min(0.04, (time - lastTime) / 1000);
      lastTime = time;
      const direction = directionRef.current;

      if (direction.x || direction.y) {
        setPlayerPosition((position) =>
          clampToFloor({
            x: position.x + direction.x * speed * delta,
            y: position.y + direction.y * speed * delta
          })
        );
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [screen]);

  useEffect(() => {
    if (screen !== "hub") return;
    setPlayerPosition((position) => clampToFloor(position));
  }, [screen]);

  return (
    <main className="phone-shell">
      <AnimatePresence mode="wait">
        {screen === "welcome" && (
          <Frame step={1} title="Accueil" className="welcome-frame" key="welcome">
            <div className="store-scene">
              <div className="shop-lamps"><span /><span /></div>
              <div className="shop-sign">
                <span className="sign-bird" />
                <strong>Wake up</strong>
                <em>to ketchup</em>
                <small>Restaurant</small>
              </div>
              <div className="brand-logo-card">
                <img src="/assets/buck-and-more-logo-transparent.png" alt="Buck & More" />
              </div>
              <MainButton className="blue-button" onClick={() => setScreen(player.name ? "hub" : "name")}>
                {player.name ? "Continuer" : "Commencer"}
              </MainButton>
            </div>
          </Frame>
        )}

        {screen === "name" && (
          <Frame step={2} title="Pseudo" key="name">
            <form
              className="name-screen"
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const name = String(data.get("name") || "PouletMaster").trim().replace(/\s+/g, "");
                updatePlayer({ ...player, name: name || "PouletMaster" });
                setScreen("rules");
              }}
            >
              <Avatar avatar={player.avatar} size="tiny" />
              <label htmlFor="name">Choisis ton pseudo</label>
              <input id="name" name="name" maxLength={14} defaultValue={player.name || "PouletMaster"} />
              <div className="leader-card">
                <h2>Meilleurs joueurs (semaine)</h2>
                {ranks.slice(0, 3).map((rank, index) => (
                  <p key={rank.name}>
                    <span>{index + 1} {rank.name}</span>
                    <b>★ {rank.score.toLocaleString("fr-FR")}</b>
                  </p>
                ))}
              </div>
              <MainButton className="blue-button" type="submit">Continuer</MainButton>
            </form>
          </Frame>
        )}

        {screen === "rules" && (
          <Frame step={3} title="Regles" key="rules">
            <div className="rules-grid">
              <article><PixelIcon type="drumstick">◖</PixelIcon><strong>Joue</strong><span>des mini-jeux</span></article>
              <article><PixelIcon type="star">★</PixelIcon><strong>Stats</strong><span>monte ton score semaine</span></article>
              <article><Trophy size={54} /><strong>Samedi</strong><span>le premier gagne 1 Baby Burger</span></article>
            </div>
            <MainButton className="blue-button" onClick={() => setScreen("avatar")}>J'ai compris</MainButton>
          </Frame>
        )}

        {screen === "avatar" && (
          <Frame step={4} title="Avatar" key="avatar">
            <div className="avatar-screen">
              <div className="avatar-preview-wrapper">
                <Avatar avatar={player.avatar} size="large" />
              </div>
              <div className="customizer" style={{ overflowY: "auto", paddingRight: "6px" }}>
                {(Object.keys(avatarOptions) as Array<keyof AvatarState>).map((key) => {
                  const isColor = ["skin", "hair", "shirt", "apron"].includes(key);
                  const label = categoryLabels[key];

                  return (
                    <div className="custom-row" key={key}>
                      <span>{label}</span>
                      <div>
                        {avatarOptions[key].map((option) => {
                          if (isColor) {
                            return (
                              <button
                                className={player.avatar[key] === option ? "active" : ""}
                                key={option}
                                style={{ "--color": option } as CSSProperties}
                                aria-label={option}
                                onClick={() => updatePlayer({ ...player, avatar: { ...player.avatar, [key]: option } })}
                              />
                            );
                          } else {
                            const optionLabel = optionLabels[option] || option;
                            return (
                              <button
                                className={`text-option ${player.avatar[key] === option ? "active" : ""}`}
                                key={option}
                                onClick={() => updatePlayer({ ...player, avatar: { ...player.avatar, [key]: option } })}
                                type="button"
                              >
                                {optionLabel}
                              </button>
                            );
                          }
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <MainButton className="blue-button" onClick={() => setScreen("hub")}>Continuer</MainButton>
          </Frame>
        )}

        {screen === "hub" && (
          <motion.section
            className="screen hub-screen"
            key="hub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <Hud player={player} onNavigate={setScreen} />
            <RouteMap />
            <section className="restaurant" ref={stageRef}>
              {toast && <motion.div className="toast" initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}>{toast}</motion.div>}
              {allDoneToday && (
                <div className="daily-complete-panel">
                  <strong>Tous tes defis du jour sont termines.</strong>
                  <span>Score semaine : {getWeeklyScore(player).toLocaleString("fr-FR")} · Rang #{currentRank}</span>
                  <small>Samedi dans {getNextSaturdayLabel()}</small>
                </div>
              )}
              {blockedGame && !allDoneToday && (
                <div className="daily-complete-panel blocked-panel">
                  <strong>Defi deja termine aujourd'hui.</strong>
                  <span>{games[blockedGame].title} est verrouille pour la journee.</span>
                  <small>Reviens demain pour rejouer.</small>
                </div>
              )}
              {hubHotspots.map((hotspot) => {
                const isNear = activeHotspot?.key === hotspot.key;
                const isDone = isGameDoneToday(player, hotspot.game);

                return (
                  <button
                    className={`hotspot ${hotspot.className} ${isNear ? "is-near" : ""} ${isDone ? "is-done" : "is-available"}`}
                    key={hotspot.key}
                    type="button"
                    aria-label={isDone ? `${hotspot.label} deja termine aujourd'hui` : isNear ? `${hotspot.label} disponible` : `Approche-toi pour ${hotspot.label.toLowerCase()}`}
                    aria-pressed={isNear}
                    onClick={() => {
                      if (isNear) chooseGame(hotspot.game);
                    }}
                  >
                    <span className="hotspot-icon">{hotspot.icon}</span>
                    <span className="hotspot-label">{isDone ? "Termine aujourd'hui" : hotspot.label}</span>
                  </button>
                );
              })}
              <div
                className="player-position"
                style={{ "--player-x": `${playerPosition.x}px`, "--player-y": `${playerPosition.y}px` } as CSSProperties}
              >
                <Avatar avatar={player.avatar} size="stage" />
              </div>
            </section>
            <div className="controls">
              <Joystick
                onMove={(direction) => {
                  directionRef.current = direction;
                }}
                onRelease={() => {
                  directionRef.current = { x: 0, y: 0 };
                }}
              />
              <motion.button className="debug-reset-button" whileTap={{ scale: 0.95 }} onClick={resetUserFlow}>
                Reset flow
              </motion.button>
              <motion.button
                className={`action-button ${activeHotspot ? "is-ready" : ""}`}
                disabled={!activeHotspot}
                whileTap={{ scale: activeHotspot ? 0.94 : 1 }}
                aria-label={activeHotspot ? activeHotspot.label : "Approche-toi d'un hotspot"}
                onClick={() => {
                  if (activeHotspot) chooseGame(activeHotspot.game);
                }}
              >
                <Hand size={48} />
              </motion.button>
            </div>
          </motion.section>
        )}

        {screen === "intro" && (
          <Frame step={7} title={player.seenTutorials[selectedGame] ? currentGame.title : "1ere fois"} key="intro">
            <div className="tutorial">
              <h2>{currentGame.title} : comment ca marche ?</h2>
              <div className="tutorial-grid">
                {currentGame.steps.map((step, index) => (
                  <article key={step}>
                    <strong>{index === 0 ? "Lis" : index === 1 ? "Agis" : "Evite"}</strong>
                    <PixelIcon type={index === 2 ? "wrong" : currentGame.icon}>{index === 2 ? "×" : currentGame.icon}</PixelIcon>
                    <span>{step}</span>
                  </article>
                ))}
              </div>
            </div>
            <MainButton
              onClick={() => {
                const today = getTodayKey();
                const gainedLabel = formatStatGains(currentGame.statGains);
                updatePlayer({
                  ...player,
                  weeklyStats: applyStatGains(player.weeklyStats, currentGame.statGains),
                  history: {
                    ...player.history,
                    totalGamesPlayed: player.history.totalGamesPlayed + 1
                  },
                  dailyAttempts: {
                    ...player.dailyAttempts,
                    [selectedGame]: today
                  },
                  seenTutorials: { ...player.seenTutorials, [selectedGame]: true },
                  lastGame: selectedGame
                });
                setToast(gainedLabel);
                window.setTimeout(() => setToast(""), 2600);
                setScreen("score");
              }}
            >
              Ok, go !
            </MainButton>
            <button className="secondary-button" onClick={() => setScreen("hub")}>Retour</button>
          </Frame>
        )}

        {screen === "score" && (
          <Frame step={8} title="Score" key="score">
            <div className="score-screen">
              <div className="score-big"><PixelIcon type="star">★</PixelIcon><strong>{formatStatGains(games[player.lastGame || selectedGame].statGains)}</strong><span>Nouveau total</span><b>★ {getWeeklyScore(player).toLocaleString("fr-FR")}</b></div>
              <div className="score-stat score-pop"><PixelIcon type="drumstick">◖</PixelIcon><span>Rang actuel</span><b>#{currentRank}</b></div>
              <div className="score-stat"><span className="heart" /><span>Defis du jour</span><b>{(Object.keys(games) as GameKey[]).filter((game) => isGameDoneToday(player, game)).length}/4</b></div>
              <div className="leader-card compact">
                <h2>Classement</h2>
                {leaderboard.slice(0, 5).map((rank, index) => (
                  <p className={rank.isCurrent ? "active" : ""} key={`${rank.name}-${index}`}>
                    <span>{index + 1} {rank.name}</span>
                    <b>★ {rank.score.toLocaleString("fr-FR")}</b>
                  </p>
                ))}
              </div>
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}

        {screen === "leaderboard" && (
          <Frame step={9} title="Classement" key="leaderboard">
            <div className="meta-screen">
              <div className="prize-banner">
                <Trophy size={34} />
                <span>Le premier samedi gagne 1 Baby Burger chez BUCK.</span>
              </div>
              <div className="leaderboard-list">
                {leaderboard.map((rank, index) => (
                  <article className={rank.isCurrent ? "is-current" : ""} key={`${rank.name}-${index}`}>
                    <b>{index + 1}</b>
                    <Avatar avatar={rank.avatar} size="tiny" />
                    <span>{rank.name}</span>
                    <strong>★ {rank.score.toLocaleString("fr-FR")}</strong>
                    {rank.isCurrent && <em>toi</em>}
                  </article>
                ))}
              </div>
              <MetaNav onNavigate={setScreen} />
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}

        {screen === "reward" && (
          <Frame step={10} title="Recompense" key="reward">
            <div className="meta-screen reward-screen">
              <div className={isChampion ? "reward-card champion" : "reward-card"}>
                <Gift size={48} />
                <h2>Recompense du samedi</h2>
                <p>Le premier du classement de la semaine gagne 1 Baby Burger.</p>
                {isChampion ? (
                  <>
                    <strong>Tu es le champion de la semaine.</strong>
                    <span>Presente cet ecran chez BUCK pour recuperer ton Baby Burger.</span>
                  </>
                ) : (
                  <>
                    <strong>Rang actuel : #{currentRank}</strong>
                    <span>Si tu es champion, montre ton ecran a l'equipe BUCK.</span>
                  </>
                )}
              </div>
              <MetaNav onNavigate={setScreen} />
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}

        {screen === "hallOfFame" && (
          <Frame step={11} title="Hall of Fame" key="hallOfFame">
            <div className="meta-screen">
              <div className="fame-list">
                {hallOfFameEntries.map((entry) => (
                  <article key={entry.week}>
                    <Medal size={30} />
                    <span>Semaine {entry.week}</span>
                    <strong>{entry.champion}</strong>
                    <small>{entry.prize}</small>
                  </article>
                ))}
              </div>
              <MetaNav onNavigate={setScreen} />
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}

        {screen === "profile" && (
          <Frame step={12} title="Profil" key="profile">
            <div className="meta-screen profile-screen">
              <div className="profile-card">
                <Avatar avatar={player.avatar} size="large" />
                <div>
                  <h2>{player.name || "PouletMaster"}</h2>
                  <strong>★ {getWeeklyScore(player).toLocaleString("fr-FR")}</strong>
                  <span>Rang #{currentRank}</span>
                </div>
              </div>
              <StatBars stats={player.weeklyStats} />
              <div className="history-grid">
                <article><Crown size={24} /><span>Semaines</span><b>{player.history.weeksPlayed}</b></article>
                <article><Trophy size={24} /><span>Victoires</span><b>{player.history.victories}</b></article>
                <article><BarChart3 size={24} /><span>Mini-jeux</span><b>{player.history.totalGamesPlayed}</b></article>
              </div>
              <MetaNav onNavigate={setScreen} />
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}
      </AnimatePresence>
    </main>
  );
}
