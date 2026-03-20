import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const TARGET_TEXT = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const CYCLES_PER_LETTER = 2;
const SHUFFLE_TIME = 50;

const getRandomChar = () => TARGET_TEXT[Math.floor(Math.random() * TARGET_TEXT.length)]!;

export const EncryptedText = ({
  text,
  className,
  interval = 50,
}: {
  text: string;
  className?: string;
  interval?: number;
}) => {
  const [displayText, setDisplayText] = useState(text.split(""));
  const [iteration, setIteration] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (iteration < text.length * CYCLES_PER_LETTER) {
        setDisplayText((prev) =>
          prev.map((char, index) => {
            if (iteration / CYCLES_PER_LETTER > index) {
              return text[index]!;
            }
            return getRandomChar();
          })
        );
        setIteration((prev) => prev + 1);
      }
    }, SHUFFLE_TIME);

    return () => clearInterval(intervalId);
  }, [text, iteration]);

  return (
    <motion.span
      className={cn("font-mono", className)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {displayText.join("")}
    </motion.span>
  );
};
