import React from "react";

export function GameZoneDiagram() {
  return (
    <svg
      role="img"
      aria-labelledby="gz-title gz-desc"
      viewBox="0 0 960 620"
      className="w-full h-auto select-none"
      style={{
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      <title id="gz-title">GameZone Architecture</title>
      <desc id="gz-desc">
        Two clients — a Capacitor 6 Android app and a desktop browser — run the same Vite
        React bundle, which calls backend/server.js, an Express API of roughly fifteen
        endpoints, which reads and writes a SQLite database of seven tables: stations,
        sessions, settings, activities, snacks, cafeteria_expenses and revenue_history.
        SQLite is configured for a slow spinning disk on Windows 7 running Node v13.14.0:
        journal_mode WAL, synchronous NORMAL, temp_store MEMORY, cache_size -10000, and
        startup seeding wrapped in a single transaction. A separate strip shows the
        mid-session rollover rule: a station is occupied, a request to add-game arrives,
        the played overage is computed and deducted from the new activity's duration, and
        occupancy is never broken.
      </desc>

      <defs>
        <marker
          id="arrow-muted"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#8FA0B0" />
        </marker>
        <marker
          id="arrow-focal"
          viewBox="0 0 10 10"
          refX="6"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFC46B" />
        </marker>
      </defs>

      {/* Layer A: Background Strata & Dividers */}
      <g id="layer-strata">
        {/* Zone Divider */}
        <line x1="0" y1="460" x2="960" y2="460" stroke="#1B2430" strokeWidth="1" />
      </g>

      {/* Layer B: Edges & Arrows */}
      <g id="layer-edges">
        {/* F1: M1 -> M3 */}
        <path
          d="M 200 68 C 250 68, 250 123, 300 123"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* F2: M2 -> M3 */}
        <path
          d="M 200 178 C 250 178, 250 123, 300 123"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* F3: M3 -> M4 */}
        <path
          d="M 490 123 L 590 123"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* F4: M4 -> M5 */}
        <path
          d="M 685 151 L 685 234"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* F5: M6 -> M4 */}
        <path
          d="M 470 272 L 530 272 L 530 151 L 590 151"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          markerEnd="url(#arrow-muted)"
        />

        {/* Pragma Callout Pointer Line */}
        <line x1="560" y1="365" x2="590" y2="300" stroke="#FFC46B" strokeWidth="1" />

        {/* R1 -> R2 Arrow */}
        <path
          d="M 220 526 L 258 526"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* R2 -> R3 Arrow */}
        <path
          d="M 450 526 L 488 526"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />

        {/* R3 -> R4 Arrow */}
        <path
          d="M 680 526 L 718 526"
          fill="none"
          stroke="#8FA0B0"
          strokeWidth="1.5"
          markerEnd="url(#arrow-muted)"
        />
      </g>

      {/* Layer C: Nodes & Shapes */}
      <g id="layer-nodes">
        {/* M1: Android app */}
        <g id="node-m1" data-node="node-m1" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>Android app</title>
          <desc>Capacitor 6 Android app client with package ID com.gamezone.app</desc>
          <rect
            x="30"
            y="40"
            width="170"
            height="56"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="115" y="64" textAnchor="middle" fill="#EDF1F5" fontSize="11" fontWeight="500">
            Android app
          </text>
          <text x="115" y="80" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            Capacitor 6 · com.gamezone.app
          </text>
        </g>

        {/* M2: desktop browser */}
        <g id="node-m2" data-node="node-m2" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>desktop browser</title>
          <desc>Desktop web browser client running the Vite React application</desc>
          <rect
            x="30"
            y="150"
            width="170"
            height="56"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="115" y="183" textAnchor="middle" fill="#EDF1F5" fontSize="11" fontWeight="500">
            desktop browser
          </text>
        </g>

        {/* M3: same Vite bundle */}
        <g id="node-m3" data-node="node-m3" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>same Vite bundle</title>
          <desc>Shared React 18 + Vite client bundle serving both clients</desc>
          <rect
            x="300"
            y="95"
            width="190"
            height="56"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="395" y="119" textAnchor="middle" fill="#EDF1F5" fontSize="11" fontWeight="500">
            same Vite bundle
          </text>
          <text x="395" y="135" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            React 18 + Vite
          </text>
        </g>

        {/* M4: backend/server.js */}
        <g id="node-m4" data-node="node-m4" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>backend/server.js</title>
          <desc>Express backend server exposing approximately 15 REST endpoints</desc>
          <rect
            x="590"
            y="95"
            width="190"
            height="56"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="685" y="119" textAnchor="middle" fill="#EDF1F5" fontSize="11" fontWeight="500">
            backend/server.js
          </text>
          <text x="685" y="135" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            Express · ~15 endpoints
          </text>
        </g>

        {/* M5: SQLite */}
        <g id="node-m5" data-node="node-m5" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>SQLite</title>
          <desc>SQLite database storing 7 tables: stations, sessions, settings, activities, snacks, cafeteria_expenses, revenue_history</desc>
          <path
            d="M 590 250 v 80 a 95 16 0 0 0 190 0 v -80"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <ellipse
            cx="685"
            cy="250"
            rx="95"
            ry="16"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="685" y="272" textAnchor="middle" fill="#EDF1F5" fontSize="11" fontWeight="500">
            SQLite
          </text>
          <text x="685" y="287" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            stations · sessions · settings
          </text>
          <text x="685" y="302" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            activities · snacks
          </text>
          <text x="685" y="317" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            cafeteria_expenses · revenue_history
          </text>
        </g>

        {/* M6: Start-GameZone.bat */}
        <g id="node-m6" data-node="node-m6" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>Start-GameZone.bat</title>
          <desc>One-click batch script launcher running locally on the cafe machine</desc>
          <rect
            x="300"
            y="250"
            width="170"
            height="44"
            rx="4"
            fill="#10151C"
            stroke="#8FA0B0"
            strokeWidth="1"
          />
          <text x="385" y="276" textAnchor="middle" fill="#8FA0B0" fontSize="11">
            Start-GameZone.bat
          </text>
        </g>

        {/* Pragma Callout Box */}
        <g id="pragma-callout-box" data-node="pragma-callout-box" className="cursor-pointer hover:opacity-80 transition-opacity">
          <rect
            x="290"
            y="325"
            width="270"
            height="102"
            rx="4"
            fill="#10151C"
            stroke="#FFC46B"
            strokeWidth="1"
          />
          <text x="302" y="342" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
            PRAGMA journal_mode = WAL
          </text>
          <text x="302" y="357" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
            PRAGMA synchronous  = NORMAL
          </text>
          <text x="302" y="372" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
            PRAGMA temp_store   = MEMORY
          </text>
          <text x="302" y="387" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
            PRAGMA cache_size   = -10000
          </text>
          <text x="302" y="402" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
            BEGIN TRANSACTION … COMMIT
          </text>
          <text x="302" y="417" fill="#FFC46B" fontSize="11" xmlSpace="preserve">
              (startup seeding)
          </text>
        </g>

        {/* R1: station occupied */}
        <g id="node-r1" data-node="node-r1" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>station occupied</title>
          <desc>Station currently has an active gaming session</desc>
          <rect
            x="30"
            y="500"
            width="190"
            height="52"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="125" y="530" textAnchor="middle" fill="#EDF1F5" fontSize="11">
            station occupied
          </text>
        </g>

        {/* R2: POST /api/sessions/add-game */}
        <g id="node-r2" data-node="node-r2" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>POST /api/sessions/add-game</title>
          <desc>API call triggered when adding or switching game during active session</desc>
          <rect
            x="260"
            y="500"
            width="190"
            height="52"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="355" y="530" textAnchor="middle" fill="#EDF1F5" fontSize="11">
            POST /api/sessions/add-game
          </text>
        </g>

        {/* R3: overage computed */}
        <g id="node-r3" data-node="node-r3" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>overage computed</title>
          <desc>System computes played overage time from initial activity duration</desc>
          <rect
            x="490"
            y="500"
            width="190"
            height="52"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="585" y="530" textAnchor="middle" fill="#EDF1F5" fontSize="11">
            overage computed
          </text>
        </g>

        {/* R4: deducted from new activity */}
        <g id="node-r4" data-node="node-r4" className="cursor-pointer hover:opacity-80 transition-opacity">
          <title>deducted from new activity</title>
          <desc>Computed overage is deducted from the new activity duration</desc>
          <rect
            x="720"
            y="500"
            width="190"
            height="52"
            rx="4"
            fill="#10151C"
            stroke="#1B2430"
            strokeWidth="1"
          />
          <text x="815" y="530" textAnchor="middle" fill="#EDF1F5" fontSize="11">
            deducted from new activity
          </text>
        </g>
      </g>

      {/* Layer D: Edge Labels & Annotations */}
      <g id="layer-labels">
        {/* F3 label */}
        <text x="540" y="113" textAnchor="middle" fill="#8FA0B0" fontSize="11">
          fetch /api/*
        </text>

        {/* F4 label */}
        <text x="697" y="195" textAnchor="start" fill="#8FA0B0" fontSize="11">
          sqlite3
        </text>

        {/* F5 label */}
        <text x="525" y="205" textAnchor="end" fill="#8FA0B0" fontSize="11">
          one click, on the cafe's own machine
        </text>

        {/* Pragma Callout Caption */}
        <text
          x="425"
          y="445"
          textAnchor="middle"
          fill="#FFC46B"
          fontSize="13"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Windows 7. 5400 rpm. Node v13.14.0.
        </text>

        {/* Session-Rollover Section Header */}
        <text x="30" y="478" fill="#8FA0B0" fontSize="11">
          mid-session rollover — Snooker → PS5, same station
        </text>

        {/* Strip Caption */}
        <text
          x="480"
          y="585"
          textAnchor="middle"
          fill="#FFC46B"
          fontSize="13"
          style={{ fontFamily: "var(--font-display)" }}
        >
          occupancy unbroken
        </text>

        {/* File Path Evidence */}
        <text x="480" y="608" textAnchor="middle" fill="#8FA0B0" fontSize="11">
          backend/database.js · backend/server.js · frontend/capacitor.config.json
        </text>
      </g>
    </svg>
  );
}

export default GameZoneDiagram;
