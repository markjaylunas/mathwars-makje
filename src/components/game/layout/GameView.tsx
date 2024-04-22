import { Problem } from "@/src/lib/types";
import Number from "./Number";
import Text from "../../ui/text";
import { cn } from "@/src/lib/utils";
import { PerkType } from "@prisma/client";

type Props = {
  problem: Problem;
  activePerkList: PerkType[];
};
const GameView = ({ problem, activePerkList }: Props) => {
  const { operationSymbol } = problem;
  const topNumbers = problem.numberList.slice(0, -1);
  const lastNumber = problem.numberList[problem.numberList.length - 1];
  const userAnswerLength = problem.userAnswer
    ? problem.userAnswer.toString().length
    : 0;

  const maxDigitLength = Math.max(
    userAnswerLength,
    ...problem.numberList.map((num) => num.toString().length)
  );
  const { userAnswer, status } = problem;

  return (
    <div className="mx-auto flex max-w-fit flex-auto flex-col justify-center gap-1 p-1 transition-all duration-150 ease-in-out">
      <div>
        {activePerkList.length > 0 &&
          activePerkList.map((perk) => (
            <div key={perk} className="flex items-center justify-center gap-2">
              <Text className="text-xs font-bold text-green-500">{perk}</Text>
            </div>
          ))}
      </div>
      <div className="flex items-end justify-between gap-5">
        <Text className="text-right text-5xl font-medium">
          {operationSymbol}
        </Text>
        <div>
          {topNumbers.map((firstNumber, index) => (
            <Number
              key={index}
              maxDigitLength={maxDigitLength}
              numberFullValue={firstNumber}
            />
          ))}
          <Number
            numberFullValue={lastNumber}
            maxDigitLength={maxDigitLength}
          />
        </div>
      </div>
      <div className="border-[3px] border-gray-600 dark:border-gray-300" />
      <div className="flex items-end justify-end gap-5">
        {userAnswer && (
          <Number
            numberFullValue={userAnswer || 0}
            maxDigitLength={maxDigitLength}
            status={status}
          />
        )}
        {!userAnswer && <div className={cn("h-[48px] w-full")} />}
      </div>
    </div>
  );
};

export default GameView;
