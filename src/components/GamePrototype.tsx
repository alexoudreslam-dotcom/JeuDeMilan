"use client";

import { AnimatePresence, motion } from "motion/react";
import { useDrag } from "@use-gesture/react";
import { ChevronLeft, ChevronRight, Hand, Trophy } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

type Screen = "welcome" | "name" | "rules" | "avatar" | "hub" | "intro" | "score";
type GameKey = "fridge" | "plating" | "jukebox" | "order";

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
  score: number;
  nuggets: number;
  attempts: number;
  avatar: AvatarState;
  seenTutorials: Record<string, boolean>;
  lastGame?: GameKey;
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
  score: 1250,
  nuggets: 84,
  attempts: 3,
  avatar: {
    skin: "#c98a58",
    hair: "#a94725",
    shirt: "#f1eee2",
    apron: "#e3a92f",
    hat: "none",
    accessory: "none",
    badge: "none"
  },
  seenTutorials: {}
};

const games: Record<
  GameKey,
  {
    title: string;
    label: string;
    stat: string;
    score: number;
    icon: string;
    steps: [string, string, string];
  }
> = {
  fridge: {
    title: "Frigo",
    label: "FRIGO",
    stat: "Organisation",
    score: 130,
    icon: "▤",
    steps: ["Repere l'intrus", "Range les bons produits", "Garde le frigo clean"]
  },
  plating: {
    title: "Plating",
    label: "COMPO",
    stat: "Precision",
    score: 180,
    icon: "◉",
    steps: ["Lis le ticket", "Glisse les bons items", "Evite les leurres"]
  },
  jukebox: {
    title: "Jukebox",
    label: "MUSIQUE",
    stat: "Ambiance",
    score: 95,
    icon: "♪",
    steps: ["Observe la salle", "Choisis le bon mood", "Garde les clients contents"]
  },
  order: {
    title: "Commande",
    label: "CLIENT",
    stat: "Service",
    score: 115,
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

const ranks = [
  ["CrisPy", 2450],
  ["FriteKing", 2100],
  ["NuggLife", 1780],
  ["WingBoss", 1250]
] as const;

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
    return {
      ...defaultPlayer,
      ...parsed,
      avatar: {
        ...defaultPlayer.avatar,
        ...(parsed.avatar || {})
      }
    };
  } catch {
    return defaultPlayer;
  }
}

function savePlayer(player: PlayerState) {
  window.localStorage.setItem("buck-crew-next", JSON.stringify(player));
}

function freshPlayer(): PlayerState {
  return {
    ...defaultPlayer,
    avatar: { ...defaultPlayer.avatar },
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

function Hud({ player }: { player: PlayerState }) {
  return (
    <header className="hud">
      <div className="hud-cell">
        <PixelIcon type="star">★</PixelIcon>
        <strong>{player.score.toLocaleString("fr-FR")}</strong>
      </div>
      <div className="hud-cell hud-wide">
        <PixelIcon type="calendar">▣</PixelIcon>
        <span>Score<br />semaine</span>
      </div>
      <div className="hud-cell">
        <PixelIcon type="drumstick">◖</PixelIcon>
        <strong>{player.nuggets}</strong>
      </div>
      <div className="hud-cell heart-cell">
        <span className="heart" />
        <span className="heart" />
        <span className="heart" />
        <small>Tentatives</small>
      </div>
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

export function GamePrototype() {
  const stageRef = useRef<HTMLElement | null>(null);
  const directionRef = useRef<Direction>({ x: 0, y: 0 });
  const [screen, setScreen] = useState<Screen>("welcome");
  const [player, setPlayer] = useState<PlayerState>(defaultPlayer);
  const [selectedGame, setSelectedGame] = useState<GameKey>("plating");
  const [playerPosition, setPlayerPosition] = useState<StagePosition>({ x: 178, y: 386 });
  const [stageSize, setStageSize] = useState<StageSize>({ width: 0, height: 0 });

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
    const rows = [...ranks, [player.name || "PouletMaster", player.score] as const].sort((a, b) => b[1] - a[1]);
    return rows.slice(0, 5);
  }, [player.name, player.score]);

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
                {ranks.slice(0, 3).map(([name, score], index) => (
                  <p key={name}>
                    <span>{index + 1} {name}</span>
                    <b>★ {score.toLocaleString("fr-FR")}</b>
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
              <article><PixelIcon type="star">★</PixelIcon><strong>Ameliore</strong><span>ton score semaine</span></article>
              <article><Trophy size={54} /><strong>Samedi</strong><span>le gagnant repart avec une recompense</span></article>
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
            <Hud player={player} />
            <RouteMap />
            <section className="restaurant" ref={stageRef}>
              {hubHotspots.map((hotspot) => {
                const isNear = activeHotspot?.key === hotspot.key;

                return (
                  <button
                    className={`hotspot ${hotspot.className} ${isNear ? "is-near" : ""}`}
                    key={hotspot.key}
                    type="button"
                    aria-label={isNear ? `${hotspot.label} disponible` : `Approche-toi pour ${hotspot.label.toLowerCase()}`}
                    aria-pressed={isNear}
                    onClick={() => {
                      if (isNear) chooseGame(hotspot.game);
                    }}
                  >
                    <span className="hotspot-icon">{hotspot.icon}</span>
                    <span className="hotspot-label">{hotspot.label}</span>
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
                const gained = currentGame.score;
                updatePlayer({
                  ...player,
                  score: player.score + gained,
                  nuggets: player.nuggets + 5,
                  attempts: Math.max(0, player.attempts - 1),
                  seenTutorials: { ...player.seenTutorials, [selectedGame]: true },
                  lastGame: selectedGame
                });
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
              <div className="score-big"><PixelIcon type="star">★</PixelIcon><strong>+{games[player.lastGame || selectedGame].score}</strong><span>Nouveau total</span><b>★ {player.score.toLocaleString("fr-FR")}</b></div>
              <div className="score-stat"><PixelIcon type="drumstick">◖</PixelIcon><span>{games[player.lastGame || selectedGame].stat}</span><b>{player.nuggets - 5} → {player.nuggets}</b></div>
              <div className="score-stat"><span className="heart" /><span>Tentatives restantes</span><b>{"♥".repeat(player.attempts)}{"♡".repeat(3 - player.attempts)}</b></div>
              <div className="leader-card compact">
                <h2>Classement</h2>
                {leaderboard.map(([name, score], index) => (
                  <p className={name === player.name ? "active" : ""} key={`${name}-${index}`}>
                    <span>{index + 1} {name}</span>
                    <b>★ {score.toLocaleString("fr-FR")}</b>
                  </p>
                ))}
              </div>
            </div>
            <MainButton onClick={() => setScreen("hub")}>Retour au restaurant</MainButton>
          </Frame>
        )}
      </AnimatePresence>
    </main>
  );
}
