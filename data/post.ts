import prisma from "@lib/prisma";
import { Game, Prisma } from "@prisma/client";

export const createGame = async (params: {
  gameParams: Prisma.GameCreateInput;
}): Promise<Game> => {
  const { gameParams } = params;
  const game = await prisma.game.create({
    data: gameParams,
  });

  if (!game) {
    throw new Error("Failed to create game");
  }

  await prisma.user.update({
    where: {
      id: game.userId,
    },
    data: {
      coin: {
        increment: gameParams.coin,
      },
    },
  });
  return game;
};
