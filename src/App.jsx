import React, { useState } from "react";

const players = [
  { name: "Red", color: "#e53935", light: "#ffcdd2" },
  { name: "Green", color: "#43a047", light: "#c8e6c9" },
  { name: "Yellow", color: "#fbc02d", light: "#fff9c4" },
  { name: "Blue", color: "#1e88e5", light: "#bbdefb" },
];

const startPositions = [0, 13, 26, 39];

const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];

function App() {
  const [tokens, setTokens] = useState([
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
    [-1, -1, -1, -1],
  ]);

  const [player, setPlayer] = useState(0);
  const [dice, setDice] = useState(1);
  const [rolled, setRolled] = useState(false);
  const [message, setMessage] = useState("Red player's turn");
  const [winner, setWinner] = useState(null);

  const rollDice = () => {
    if (rolled || winner !== null) return;

    const value = Math.floor(Math.random() * 6) + 1;

    setDice(value);
    setRolled(true);

    const movable = tokens[player].some((p) => {
      if (p === -1) return value === 6;
      return p + value <= 57;
    });

    if (!movable) {
      setMessage(
        `${players[player].name} cannot move.`
      );

      setTimeout(() => {
        changeTurn();
      }, 1000);
    } else {
      setMessage(
        `${players[player].name} rolled ${value}. Tap a token.`
      );
    }
  };

  const changeTurn = () => {
    const next = (player + 1) % 4;

    setPlayer(next);
    setDice(1);
    setRolled(false);

    setMessage(`${players[next].name} player's turn`);
  };

  const moveToken = (tokenIndex) => {
    if (!rolled || winner !== null) return;

    const value = dice;
    const current = tokens[player][tokenIndex];

    if (current === -1 && value !== 6) {
      setMessage("You need a 6 to bring this token out.");
      return;
    }

    if (current !== -1 && current + value > 57) {
      setMessage("This token cannot move.");
      return;
    }

    const newPosition =
      current === -1 ? 0 : current + value;

    const newTokens = tokens.map((row) => [...row]);

    newTokens[player][tokenIndex] = newPosition;

    let captured = false;

    if (newPosition >= 0 && newPosition < 52) {
      const actualPosition =
        (startPositions[player] + newPosition) % 52;

      if (!safePositions.includes(actualPosition)) {
        for (let p = 0; p < 4; p++) {
          if (p === player) continue;

          for (let t = 0; t < 4; t++) {
            const enemy = newTokens[p][t];

            if (enemy >= 0 && enemy < 52) {
              const enemyActual =
                (startPositions[p] + enemy) % 52;

              if (enemyActual === actualPosition) {
                newTokens[p][t] = -1;
                captured = true;
              }
            }
          }
        }
      }
    }

    setTokens(newTokens);

    const hasWon = newTokens[player].every(
      (p) => p === 57
    );

    if (hasWon) {
      setWinner(player);
      setMessage(
        `${players[player].name} player wins!`
      );
      return;
    }

    if (captured) {
      setMessage(
        `${players[player].name} captured a token!`
      );
    }

    if (value === 6) {
      setRolled(false);

      if (!captured) {
        setMessage(
          `${players[player].name} gets another turn!`
        );
      }
    } else {
      setTimeout(() => {
        changeTurn();
      }, 500);
    }
  };

  const resetGame = () => {
    setTokens([
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
      [-1, -1, -1, -1],
    ]);

    setPlayer(0);
    setDice(1);
    setRolled(false);
    setWinner(null);
    setMessage("Red player's turn");
  };

  const getBoardPosition = (playerIndex, position) => {
    if (position < 0 || position >= 52) {
      return null;
    }

    return (
      (startPositions[playerIndex] + position) % 52
    );
  };

  const getXY = (boardPosition) => {
    const side = Math.floor(boardPosition / 13);
    const position = boardPosition % 13;

    let x;
    let y;

    if (side === 0) {
      x = 30 + (position / 12) * 40;
      y = 30;
    } else if (side === 1) {
      x = 70;
      y = 30 + (position / 12) * 40;
    } else if (side === 2) {
      x = 70 - (position / 12) * 40;
      y = 70;
    } else {
      x = 30;
      y = 70 - (position / 12) * 40;
    }

    return { x, y };
  };

  return (
    <div className="app">
      <style>{`

        * {
          box-sizing: border-box;
        }

        html,
        body,
        #root {
          margin: 0;
          min-height: 100%;
          width: 100%;
        }

        body {
          font-family: Arial, sans-serif;
          background: #edf2f7;
          -webkit-user-select: none;
          user-select: none;
        }

        button {
          font-family: Arial, sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .app {
          min-height: 100vh;
          padding-bottom: 30px;
        }

        .header {
          background: #1976d2;
          color: white;
          text-align: center;
          padding: 18px 10px;
        }

        .header h1 {
          margin: 0;
          font-size: clamp(24px, 5vw, 34px);
        }

        .header p {
          margin: 6px 0 0;
          font-size: 14px;
        }

        .container {
          width: min(680px, 96%);
          margin: 15px auto;
        }

        .status {
          background: white;
          border-radius: 14px;
          padding: 12px 15px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 3px 10px #0002;
          margin-bottom: 15px;
        }

        .status-dot {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .status-name {
          font-weight: bold;
          font-size: 17px;
        }

        .status-message {
          color: #555;
          margin-top: 4px;
          font-size: 14px;
        }

        .board {
          position: relative;
          width: min(94vw, 620px);
          aspect-ratio: 1;
          margin: auto;
          background: white;
          border: 5px solid #222;
          border-radius: 8px;
          overflow: hidden;
          touch-action: manipulation;
        }

        .home {
          position: absolute;
          width: 40%;
          height: 40%;
          padding: 5%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 3;
        }

        .red-home {
          top: 0;
          left: 0;
          background: #e53935;
        }

        .green-home {
          top: 0;
          right: 0;
          background: #43a047;
        }

        .yellow-home {
          bottom: 0;
          right: 0;
          background: #fbc02d;
        }

        .blue-home {
          bottom: 0;
          left: 0;
          background: #1e88e5;
        }

        .home-inner {
          width: 88%;
          height: 88%;
          background: white;
          border-radius: 15px;
          padding: 7%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8%;
          place-items: center;
        }

        .home-token {
          width: clamp(28px, 7vw, 45px);
          height: clamp(28px, 7vw, 45px);
          border-radius: 50%;
          border: 4px solid white;
          color: white;
          font-size: clamp(11px, 2.5vw, 16px);
          font-weight: bold;
          cursor: pointer;
          touch-action: manipulation;
          box-shadow: 0 2px 6px #0005;
        }

        .home-token.movable {
          box-shadow:
            0 0 0 4px white,
            0 3px 10px #0006;
          animation: pulse 1s infinite;
        }

        @keyframes pulse {
          50% {
            transform: scale(1.08);
          }
        }

        .track {
          position: absolute;
          left: 30%;
          top: 30%;
          width: 40%;
          height: 40%;
          z-index: 1;
        }

        .track-top,
        .track-bottom,
        .track-left,
        .track-right {
          position: absolute;
          display: grid;
          gap: 1px;
        }

        .track-top {
          top: 0;
          left: 0;
          width: 100%;
          height: 25%;
          grid-template-columns: repeat(13, 1fr);
        }

        .track-bottom {
          bottom: 0;
          left: 0;
          width: 100%;
          height: 25%;
          grid-template-columns: repeat(13, 1fr);
        }

        .track-left {
          top: 25%;
          left: 0;
          width: 25%;
          height: 50%;
          grid-template-rows: repeat(13, 1fr);
        }

        .track-right {
          top: 25%;
          right: 0;
          width: 25%;
          height: 50%;
          grid-template-rows: repeat(13, 1fr);
        }

        .cell {
          background: white;
          border: 1px solid #aaa;
        }

        .center {
          position: absolute;
          left: 40%;
          top: 40%;
          width: 20%;
          height: 20%;
          z-index: 4;
          border: 2px solid #222;
          background: white;
          overflow: hidden;
        }

        .triangle {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .moving-token {
          position: absolute;
          width: clamp(25px, 6vw, 42px);
          height: clamp(25px, 6vw, 42px);
          border-radius: 50%;
          border: 3px solid white;
          color: white;
          font-weight: bold;
          cursor: pointer;
          z-index: 8;
          transform: translate(-50%, -50%);
          box-shadow: 0 3px 8px #0006;
          touch-action: manipulation;
        }

        .controls {
          background: white;
          border-radius: 14px;
          padding: 15px;
          margin-top: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 25px;
          box-shadow: 0 3px 10px #0002;
        }

        .dice-box {
          text-align: center;
        }

        .dice-label {
          font-size: 12px;
          font-weight: bold;
          color: #555;
          margin-bottom: 5px;
        }

        .dice {
          width: 65px;
          height: 65px;
          border: 3px solid #222;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          font-size: 42px;
        }

        .roll {
          min-height: 60px;
          padding: 0 28px;
          border: none;
          border-radius: 12px;
          background: #1976d2;
          color: white;
          font-size: 18px;
          font-weight: bold;
          cursor: pointer;
          touch-action: manipulation;
        }

        .roll:active {
          transform: scale(.95);
        }

        .roll:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .players {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 15px;
        }

        .player-card {
          background: white;
          border-radius: 10px;
          padding: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-size: 14px;
        }

        .player-dot {
          width: 14px;
          height: 14px;
          border-radius: 50%;
        }

        .turn {
          font-size: 9px;
          color: #1976d2;
          font-weight: bold;
        }

        .winner {
          background: white;
          text-align: center;
          margin-top: 15px;
          padding: 20px;
          border-radius: 14px;
          box-shadow: 0 3px 10px #0002;
        }

        .winner-icon {
          font-size: 45px;
        }

        .winner h2 {
          margin: 5px 0 15px;
        }

        .reset {
          border: none;
          border-radius: 10px;
          padding: 14px 25px;
          background: #1976d2;
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          touch-action: manipulation;
        }

        .help {
          text-align: center;
          color: #666;
          font-size: 13px;
          margin-top: 15px;
        }

        @media (max-width: 600px) {

          .container {
            width: 98%;
          }

          .board {
            width: 96vw;
          }

          .controls {
            flex-direction: column;
            gap: 12px;
          }

          .roll {
            width: 100%;
          }

          .players {
            grid-template-columns: 1fr 1fr;
          }

          .player-card {
            padding: 12px 6px;
          }
        }

        @media (max-width: 380px) {

          .board {
            width: 98vw;
          }

          .header {
            padding: 14px 5px;
          }

          .status {
            padding: 10px;
          }
        }

      `}</style>

      <header className="header">
        <h1>🎲 LUDO GAME</h1>
        <p>Laptop + Android Touch Screen</p>
      </header>

      <main className="container">

        <div className="status">
          <div
            className="status-dot"
            style={{
              background: players[player].color,
            }}
          />

          <div>
            <div className="status-name">
              {players[player].name} Player
            </div>

            <div className="status-message">
              {message}
            </div>
          </div>
        </div>

        <div className="board">

          {/* RED HOME */}

          <div className="home red-home">
            <div className="home-inner">
              {tokens[0].map((position, index) => (
                <HomeToken
                  key={index}
                  player={0}
                  index={index}
                  position={position}
                  movable={
                    rolled &&
                    player === 0 &&
                    (position === -1
                      ? dice === 6
                      : position + dice <= 57)
                  }
                  onClick={() => moveToken(index)}
                />
              ))}
            </div>
          </div>

          {/* GREEN HOME */}

          <div className="home green-home">
            <div className="home-inner">
              {tokens[1].map((position, index) => (
                <HomeToken
                  key={index}
                  player={1}
                  index={index}
                  position={position}
                  movable={
                    rolled &&
                    player === 1 &&
                    (position === -1
                      ? dice === 6
                      : position + dice <= 57)
                  }
                  onClick={() => moveToken(index)}
                />
              ))}
            </div>
          </div>

          {/* YELLOW HOME */}

          <div className="home yellow-home">
            <div className="home-inner">
              {tokens[2].map((position, index) => (
                <HomeToken
                  key={index}
                  player={2}
                  index={index}
                  position={position}
                  movable={
                    rolled &&
                    player === 2 &&
                    (position === -1
                      ? dice === 6
                      : position + dice <= 57)
                  }
                  onClick={() => moveToken(index)}
                />
              ))}
            </div>
          </div>

          {/* BLUE HOME */}

          <div className="home blue-home">
            <div className="home-inner">
              {tokens[3].map((position, index) => (
                <HomeToken
                  key={index}
                  player={3}
                  index={index}
                  position={position}
                  movable={
                    rolled &&
                    player === 3 &&
                    (position === -1
                      ? dice === 6
                      : position + dice <= 57)
                  }
                  onClick={() => moveToken(index)}
                />
              ))}
            </div>
          </div>

          {/* TRACK */}

          <div className="track">

            <div className="track-top">
              {Array.from({ length: 13 }).map(
                (_, i) => (
                  <div className="cell" key={i} />
                )
              )}
            </div>

            <div className="track-bottom">
              {Array.from({ length: 13 }).map(
                (_, i) => (
                  <div className="cell" key={i} />
                )
              )}
            </div>

            <div className="track-left">
              {Array.from({ length: 13 }).map(
                (_, i) => (
                  <div className="cell" key={i} />
                )
              )}
            </div>

            <div className="track-right">
              {Array.from({ length: 13 }).map(
                (_, i) => (
                  <div className="cell" key={i} />
                )
              )}
            </div>

          </div>

          {/* CENTER */}

          <div className="center">

            <div
              className="triangle"
              style={{
                background: players[0].color,
                clipPath:
                  "polygon(0 0, 100% 0, 50% 50%)",
              }}
            />

            <div
              className="triangle"
              style={{
                background: players[1].color,
                clipPath:
                  "polygon(100% 0, 100% 100%, 50% 50%)",
              }}
            />

            <div
              className="triangle"
              style={{
                background: players[2].color,
                clipPath:
                  "polygon(0 100%, 100% 100%, 50% 50%)",
              }}
            />

            <div
              className="triangle"
              style={{
                background: players[3].color,
                clipPath:
                  "polygon(0 0, 0 100%, 50% 50%)",
              }}
            />

          </div>

          {/* MOVING TOKENS */}

          {tokens.map((playerTokens, playerIndex) =>
            playerTokens.map(
              (position, tokenIndex) => {
                const boardPosition =
                  getBoardPosition(
                    playerIndex,
                    position
                  );

                if (boardPosition === null) {
                  return null;
                }

                const { x, y } =
                  getXY(boardPosition);

                return (
                  <button
                    key={
                      playerIndex +
                      "-" +
                      tokenIndex
                    }
                    className="moving-token"
                    onClick={() => {
                      if (
                        playerIndex === player
                      ) {
                        moveToken(tokenIndex);
                      }
                    }}
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      background:
                        players[playerIndex].color,
                    }}
                    aria-label={`${players[playerIndex].name} token ${
                      tokenIndex + 1
                    }`}
                  >
                    {tokenIndex + 1}
                  </button>
                );
              }
            )
          )}

        </div>

        {/* DICE */}

        <div className="controls">

          <div className="dice-box">

            <div className="dice-label">
              DICE
            </div>

            <div className="dice">
              {diceFace(dice)}
            </div>

          </div>

          <button
            className="roll"
            onClick={rollDice}
            disabled={
              rolled || winner !== null
            }
          >
            🎲 ROLL DICE
          </button>

        </div>

        {/* PLAYERS */}

        <div className="players">

          {players.map((p, i) => (
            <div
              className="player-card"
              key={p.name}
              style={{
                border:
                  player === i
                    ? `3px solid ${p.color}`
                    : "2px solid #ddd",
              }}
            >

              <span
                className="player-dot"
                style={{
                  background: p.color,
                }}
              />

              <span>{p.name}</span>

              {player === i && (
                <span className="turn">
                  TURN
                </span>
              )}

            </div>
          ))}

        </div>

        {/* WINNER */}

        {winner !== null && (
          <div className="winner">

            <div className="winner-icon">
              🏆
            </div>

            <h2>
              {players[winner].name} Player Wins!
            </h2>

            <button
              className="reset"
              onClick={resetGame}
            >
              🔄 PLAY AGAIN
            </button>

          </div>
        )}

        <div className="help">
          🎯 Roll the dice and tap/click your token
          to move.
        </div>

      </main>
    </div>
  );
}

function HomeToken({
  player,
  index,
  position,
  movable,
  onClick,
}) {
  return (
    <button
      className={
        movable
          ? "home-token movable"
          : "home-token"
      }
      disabled={!movable}
      onClick={onClick}
      style={{
        background: players[player].color,
        opacity:
          position === 57 ? 0.5 : 1,
      }}
      aria-label={`${players[player].name} token ${
        index + 1
      }`}
    >
      {index + 1}
    </button>
  );
}

function diceFace(number) {
  const faces = {
    1: "⚀",
    2: "⚁",
    3: "⚂",
    4: "⚃",
    5: "⚄",
    6: "⚅",
  };

  return faces[number];
}

export default App;