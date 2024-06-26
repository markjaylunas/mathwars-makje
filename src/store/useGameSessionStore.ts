import { PerkType } from "@prisma/client";
import { re } from "mathjs";
import { v4 as uuidV4 } from "uuid";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  adjustGameSettingDifficulty,
  calculateExpGained,
  generateProblem,
  getRating,
} from "../lib/game";
import {
  CLASSIC_ANSWER_DELAY_TIME,
  CLASSIC_CORRECT_ADD_TIME,
  CLASSIC_LEVEL_UP_THRESHOLD,
  CLASSIC_TIME,
  CLASSIC_WRONG_REDUCE_TIME,
  GAME_MAX_TIMER,
  INITIAL_GAME_SESSION_STATE,
} from "../lib/game.config";
import { GameInfo, GameMode, Problem } from "../lib/types";

export type GameTimerStatus =
  | "IDLE"
  | "STARTING"
  | "RUNNING"
  | "PAUSED"
  | "CONTINUING"
  | "FINISHED";

type TimerActionState = "START" | "PAUSE" | "CONTINUE" | "ANSWER" | "FINISH";

type TimerAction = {
  action: TimerActionState;
  time: number;
};

export type TimerState = {
  value: number;
  status: GameTimerStatus;
  isActive: boolean;
  pauseTime: number;
  startRunningTime: number;
  lastLapTime: number;
  lap: number;
  history: TimerAction[];
  lapHistory: number[];
  totalAddedTime: number;
  totalReducedTime: number;
  initialValue: number;
  maxTime: number;
};

export type GameSessionState = {
  initialGameMode: GameMode | null;
  gameMode: GameMode | null;
  problemList: Problem[] | null;
  problem: Problem | null;
  levelCounter: number;
  combo: number;
  gameInfo: GameInfo;
  timer: TimerState;
  isCooldown: boolean;
  activePerkList: PerkType[];
  gameCreatedAt: Date | null;
};

type UseGameSession = {
  gameSession: GameSessionState;
};

export type UseGameSessionActions = {
  setGameSession: (gameSession: GameSessionState) => void;
  setTimerValue: (value: number) => void;
  gameStart: () => void;
  gamePause: () => void;
  gameContinue: () => void;
  gameAnswer: (answer: number) => { isCorrect: boolean; isLeveledUp: boolean };
  gameFinish: () => void;
  gameReset: () => void;
  gameDoneCooldown: (adjustedGameSetting: GameMode | null) => void;
  setStatus: (status: GameTimerStatus) => void;
  applyPerk: (type: PerkType) => void;
  perkExtraTimer: () => void;
  perkNewProblem: () => void;
  perkLessChoices: () => void;
  perkMaxTime: () => void;
};

type GamePowers = {
  revealAnswer: boolean;
};

type GamePowersActions = {
  setRevealAnswer: (revealAnswer: boolean) => void;
};

const useGameSessionStore = create<
  UseGameSession & UseGameSessionActions & GamePowers & GamePowersActions
>()(
  persist(
    (set) => ({
      gameSession: INITIAL_GAME_SESSION_STATE,

      setGameSession: (gameSession) => set({ gameSession }),

      setStatus: (status) => {
        set((state) => ({
          ...state,
          gameSession: {
            ...state.gameSession,
            timer: {
              ...state.gameSession.timer,
              status,
            },
          },
        }));
      },

      setTimerValue: (value: number) => {
        set((state) => {
          const { timer } = state.gameSession;
          return {
            gameSession: {
              ...state.gameSession,
              timer: {
                ...timer,
                value,
              },
            },
          };
        });
      },

      gameStart: () => {
        set((state) => {
          const { timer } = state.gameSession;
          if (timer.status !== "STARTING") return state;

          return {
            gameSession: {
              ...state.gameSession,
              problem: generateProblem({
                gameMode: state.gameSession.gameMode,
                gameInfo: state.gameSession.gameInfo,
              }),
              gameInfo: {
                ...state.gameSession.gameInfo,
                id: uuidV4(),
              },
              timer: {
                ...timer,
                value: CLASSIC_TIME,
                status: "RUNNING",
                isActive: true,
                lap: Date.now(),
                lastLapTime: Date.now(),
                startRunningTime: Date.now(),
                history: [
                  ...timer.history,
                  { action: "START", time: Date.now() },
                ],
              },
            },
          };
        });
      },

      gameAnswer: (answer) => {
        let playerIsCorrect = false;
        let isLeveledUp = false;

        set((state) => {
          const { gameSession } = state;
          const {
            timer,
            problemList,
            problem,
            gameMode,
            gameInfo,
            levelCounter,
          } = gameSession;

          const { level } = gameInfo;

          // restrictions
          if (timer.status !== "RUNNING") return state;
          if (!problem) return state;

          // constants
          const isCorrect = answer === problem.answer;
          playerIsCorrect = isCorrect;
          let newLevelCounter = isCorrect ? levelCounter + 1 : 1;
          const doLevelUp =
            levelCounter === CLASSIC_LEVEL_UP_THRESHOLD + level * 2;
          isLeveledUp = doLevelUp;
          const initialValue = isCorrect
            ? timer.value + CLASSIC_CORRECT_ADD_TIME
            : timer.value - CLASSIC_WRONG_REDUCE_TIME;
          const timerValue = Math.min(initialValue, timer.maxTime);
          const removablePerk: PerkType[] = [
            "REMOVE_TWO_WRONG_ANSWER",
            "EXTRA_TIME",
            "NEW_PROBLEM",
            "ADD_MAX_TIME",
          ];

          // new values
          const newCoin = isCorrect
            ? gameInfo.coin + problem.coin
            : gameInfo.coin;
          const newCorrect = isCorrect
            ? gameInfo.correct + 1
            : gameInfo.correct;
          const newWrong = !isCorrect ? gameInfo.wrong + 1 : gameInfo.wrong;
          const newCombo = isCorrect ? gameSession.combo + 1 : 0;
          const newLevel = doLevelUp ? level + 1 : level;
          const newScore = gameInfo.score + newCombo * newLevel;
          const newHighestCombo =
            isCorrect && gameSession.combo + 1 > gameInfo.highestCombo
              ? gameSession.combo + 1
              : gameInfo.highestCombo;
          const newTotalAnswered = gameInfo.totalAnswered + 1;
          const currentLapTime = Date.now();
          const newLapHistory = [
            ...timer.lapHistory,
            currentLapTime - timer.lap,
          ];
          const newHistory: TimerAction[] = [
            ...timer.history,
            { action: "ANSWER", time: currentLapTime },
          ];
          const newTotalAddedTime = isCorrect
            ? timer.totalAddedTime + CLASSIC_CORRECT_ADD_TIME
            : timer.totalAddedTime;
          const newTotalReducedTime = !isCorrect
            ? timer.totalReducedTime + CLASSIC_WRONG_REDUCE_TIME
            : timer.totalReducedTime;
          const newActivePerkList = gameSession.activePerkList.filter(
            (perk) => !removablePerk.includes(perk)
          );

          // update problem
          const problemAnswered: Problem = {
            ...problem,
            userAnswer: answer,
            status: isCorrect ? "CORRECT" : "WRONG",
            lapTime: currentLapTime - timer.lap,
          };

          const newProblemList = [...(problemList || []), problemAnswered];

          // update game setting
          let adjustedGameSetting = gameMode;
          if (doLevelUp) {
            newLevelCounter = 1;
            adjustedGameSetting = adjustGameSettingDifficulty({
              gameMode: adjustedGameSetting,
            });
          }

          // generate new problem
          setTimeout(() => {
            useGameSessionStore
              .getState()
              .gameDoneCooldown(adjustedGameSetting);
          }, CLASSIC_ANSWER_DELAY_TIME);

          return {
            gameSession: {
              ...gameSession,
              activePerkList: newActivePerkList,
              gameInfo: {
                ...gameInfo,
                correct: newCorrect,
                wrong: newWrong,
                score: newScore,
                coin: newCoin,
                highestCombo: newHighestCombo,
                totalAnswered: newTotalAnswered,
                level: newLevel,
              },
              gameMode: adjustedGameSetting,
              isCooldown: true,
              combo: newCombo,
              levelCounter: newLevelCounter,
              problem: problemAnswered,
              problemList: newProblemList,
              timer: {
                ...timer,
                value: timerValue,
                lap: currentLapTime,
                lapHistory: newLapHistory,
                history: newHistory,
                totalAddedTime: newTotalAddedTime,
                totalReducedTime: newTotalReducedTime,
              },
            },
          };
        });
        return { isCorrect: playerIsCorrect, isLeveledUp };
      },

      gameDoneCooldown: (adjustedGameSetting: GameMode | null) => {
        set((state) => {
          return {
            gameSession: {
              ...state.gameSession,
              problem: generateProblem({
                gameMode: adjustedGameSetting,
                gameInfo: state.gameSession.gameInfo,
              }),

              isCooldown: false,
            },
          };
        });
      },

      gamePause: () => {
        set((state) => {
          const {
            timer,
            gameInfo: { gameTime },
          } = state.gameSession;
          if (timer.status !== "RUNNING") return state;
          const runningTime = Date.now() - timer.startRunningTime;

          return {
            gameSession: {
              ...state.gameSession,
              gameInfo: {
                ...state.gameSession.gameInfo,
                gameTime: gameTime + runningTime,
              },
              timer: {
                ...timer,
                isActive: false,
                status: "PAUSED",
                pauseTime: Date.now(),
                history: [
                  ...timer.history,
                  { action: "PAUSE", time: Date.now() },
                ],
              },
            },
          };
        });
      },

      gameContinue: () => {
        set((state) => {
          const { timer } = state.gameSession;
          if (timer.status !== "CONTINUING") return state;

          const pauseDuration = Date.now() - timer.pauseTime;
          return {
            gameSession: {
              ...state.gameSession,
              problem: generateProblem({
                gameMode: state.gameSession.gameMode,
                gameInfo: state.gameSession.gameInfo,
              }),
              timer: {
                ...timer,
                status: "RUNNING",
                isActive: true,
                lap: timer.lap + pauseDuration,
                pauseTime: 0,
                startRunningTime: Date.now(),
                history: [
                  ...timer.history,
                  { action: "CONTINUE", time: Date.now() },
                ],
              },
            },
          };
        });
      },

      gameReset: () => {
        set((state) => {
          return {
            gameSession: {
              initialGameMode: state.gameSession.initialGameMode,
              gameMode: state.gameSession.initialGameMode,
              problemList: null,
              problem: null,
              levelCounter: 1,
              combo: 0,
              gameCreatedAt: null,
              gameInfo: {
                id: "",
                correct: 0,
                wrong: 0,
                score: 0,
                highestCombo: 0,
                totalAnswered: 0,
                gameTime: 0,
                level: 1,
                rating: "E",
                coin: 0,
                expGained: 0,
              },
              isCooldown: false,
              activePerkList: [],
              timer: {
                value: CLASSIC_TIME,
                status: "IDLE",
                isActive: false,
                history: [],
                lap: 0,
                lapHistory: [],
                pauseTime: 0,
                startRunningTime: 0,
                initialValue: CLASSIC_TIME,
                totalAddedTime: 0,
                totalReducedTime: 0,
                lastLapTime: 0,
                maxTime: GAME_MAX_TIMER,
              },
            },
          };
        });
      },

      gameFinish: () => {
        set((state) => {
          const {
            timer,
            gameInfo: { gameTime },
          } = state.gameSession;
          if (timer.status !== "RUNNING") return state;
          const runningTime = Date.now() - timer.startRunningTime;
          const newGameTime = gameTime + runningTime;

          const rating = getRating({
            correct: state.gameSession.gameInfo.correct,
            wrong: state.gameSession.gameInfo.wrong,
            level: state.gameSession.gameInfo.level,
          });

          const expGained = calculateExpGained({
            gameDifficulty: state.gameSession.gameInfo.level,
            highestCombo: state.gameSession.gameInfo.highestCombo,
          });

          return {
            gameSession: {
              ...state.gameSession,
              problem: null,
              gameInfo: {
                ...state.gameSession.gameInfo,
                gameTime: newGameTime,
                rating,
                expGained: expGained,
              },
              timer: {
                ...timer,
                status: "FINISHED",
                isActive: false,
                history: [
                  ...timer.history,
                  { action: "FINISH", time: Date.now() },
                ],
              },
            },
          };
        });
      },

      revealAnswer: false,

      setRevealAnswer: (revealAnswer) => {
        set({ revealAnswer });
      },

      applyPerk: (type) => {
        set((state) => {
          return {
            ...state,
            gameSession: {
              ...state.gameSession,
              activePerkList: [...state.gameSession.activePerkList, type],
            },
          };
        });

        switch (type) {
          case "EXTRA_TIME":
            useGameSessionStore.getState().perkExtraTimer();
            break;

          case "NEW_PROBLEM":
            useGameSessionStore.getState().perkNewProblem();
            break;

          case "REMOVE_TWO_WRONG_ANSWER":
            useGameSessionStore.getState().perkLessChoices();
            break;

          case "ADD_MAX_TIME":
            useGameSessionStore.getState().perkMaxTime();
            break;
        }
      },

      perkExtraTimer: () => {
        set((state) => {
          const oneMinute = 60000;
          const newTimeValue = Math.min(
            state.gameSession.timer.value + oneMinute,
            state.gameSession.timer.maxTime
          );
          return {
            ...state,
            gameSession: {
              ...state.gameSession,
              timer: {
                ...state.gameSession.timer,
                value: newTimeValue,
                totalAddedTime:
                  state.gameSession.timer.totalAddedTime + oneMinute,
              },
            },
          };
        });
      },
      perkNewProblem: () => {
        set((state) => {
          return {
            ...state,
            gameSession: {
              ...state.gameSession,
              problem: generateProblem({
                gameMode: state.gameSession.gameMode,
                gameInfo: state.gameSession.gameInfo,
              }),
            },
          };
        });
      },
      perkLessChoices: () => {
        set((state) => {
          if (
            state.gameSession.activePerkList.includes("REMOVE_TWO_WRONG_ANSWER")
          )
            return state;
          return {
            ...state,
            gameSession: {
              ...state.gameSession,
              activePerkList: [
                ...state.gameSession.activePerkList,
                "REMOVE_TWO_WRONG_ANSWER",
              ],
            },
          };
        });
      },
      perkMaxTime: () => {
        set((state) => {
          return {
            ...state,
            gameSession: {
              ...state.gameSession,
              timer: {
                ...state.gameSession.timer,
                maxTime: state.gameSession.timer.maxTime + 60000,
              },
            },
          };
        });
      },
    }),
    {
      name: "game-session",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useGameSessionStore;
