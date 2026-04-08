"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

const CheckIcon = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn("w-6 h-6 ", className)}
    >
      <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
};

const CheckStep = ({ status }: { status: string }) => {
  return (
    <div className="w-8 h-8 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {status === "complete" ? (
          <motion.div
            key="complete"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
          >
            <CheckIcon className="text-blue-500 w-6 h-6" />
          </motion.div>
        ) : status === "current" ? (
          <motion.div
            key="current"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"
          />
        ) : (
          <motion.div
            key="pending"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="w-2 h-2 rounded-full bg-neutral-300 dark:bg-neutral-700"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export const MultiStepLoader = ({
  loadingStates,
  loading,
  duration = 2000,
}: {
  loadingStates: { text: string }[];
  loading?: boolean;
  duration?: number;
}) => {
  const [currentState, setCurrentState] = useState(0);

  useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loadingStates.length - 1 === prevState ? prevState : prevState + 1
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, duration, loadingStates.length]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md"
        >
          <div className="h-96 w-full max-w-lg relative flex flex-col justify-start pt-20 px-4 md:px-0 mx-auto">
            {loadingStates.map((state, index) => {
              const distance = Math.abs(index - currentState);
              const opacity = Math.max(1 - distance * 0.2, 0.2); // Fade out steps that are farther away
              const status =
                index < currentState
                  ? "complete"
                  : index === currentState
                  ? "current"
                  : "pending";

              return (
                <motion.div
                  key={index}
                  className={cn(
                    "flex text-left items-center gap-4 mb-4",
                    index === currentState
                      ? "text-black dark:text-white"
                      : "text-neutral-500"
                  )}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: opacity, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckStep status={status} />
                  <span
                    className={cn(
                      "text-xl md:text-2xl font-medium",
                      index === currentState &&
                        "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
                    )}
                  >
                    {state.text}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
