// Preschool game-view example — dialogue, movement, celebrate, and interaction API.
// Mirrors examples/preschool-counting/src/lesson/lesson.tsx for pack docs.
import { Challenge } from "@faraday-academy/runtime/blocks";
import { Lecture } from "@faraday-academy/runtime/blocks";
import { useState } from "react";
import { Button } from "@faraday-academy/runtime/ui/button";
import { GameView, useGameInteraction } from "./game-view";

const TARGET = 3;

function AppleCountMission() {
  const { complete } = useGameInteraction();
  const [apples, setApples] = useState(0);

  return (
    <Challenge
      goal={`Put ${TARGET} apples in the basket.`}
      done={apples >= TARGET}
      hint="Tap the big button once for each apple."
      onDone={complete}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="flex min-h-16 flex-wrap justify-center gap-2">
          {Array.from({ length: apples }, (_, i) => (
            <span key={i} className="text-4xl">
              🍎
            </span>
          ))}
        </div>
        <Button size="lg" className="min-h-14 min-w-[10rem] text-lg" onClick={() => setApples((n) => Math.min(TARGET, n + 1))}>
          Add apple
        </Button>
      </div>
    </Challenge>
  );
}

const kidSprite =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 96"><circle cx="32" cy="20" r="14" fill="#fbbf24"/><rect x="20" y="34" width="24" height="36" rx="8" fill="#3b82f6"/><rect x="16" y="70" width="10" height="22" rx="4" fill="#1e40af"/><rect x="38" y="70" width="10" height="22" rx="4" fill="#1e40af"/></svg>',
  );

const bearSprite =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><circle cx="40" cy="40" r="28" fill="#92400e"/><circle cx="28" cy="28" r="10" fill="#92400e"/><circle cx="52" cy="28" r="10" fill="#92400e"/><circle cx="32" cy="38" r="4" fill="#1c1917"/><circle cx="48" cy="38" r="4" fill="#1c1917"/></svg>',
  );

export default function PreschoolCounting() {
  return (
    <Lecture
      title="Count with Bear"
      lead="A short game scene — tap through dialogue, watch the character walk, celebrate wins."
      views={[
        {
          id: "game",
          label: "Play",
          content: (
            <GameView
              storageKey="preschool-count-demo"
              startSceneId="meadow"
              scenes={[
                {
                  id: "meadow",
                  characters: [
                    { id: "kid", sprite: kidSprite, x: 12, y: 78 },
                    { id: "bear", sprite: bearSprite, x: 78, y: 76, width: "22%" },
                  ],
                  beats: [
                    { type: "scene", backgroundColor: "oklch(0.75 0.14 145)" },
                    { type: "dialogue", speaker: "Bear", text: "Hi! Let's count together." },
                    { type: "move", characterId: "kid", x: 35, y: 78 },
                    { type: "dialogue", speaker: "Bear", text: "Fill the basket with apples!" },
                    {
                      type: "interaction",
                      title: "Count the apples",
                      celebrateOnComplete: false,
                      content: <AppleCountMission />,
                    },
                    { type: "celebrate", message: "Great counting!" },
                    { type: "dialogue", speaker: "Bear", text: "You did it!" },
                  ],
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
}
