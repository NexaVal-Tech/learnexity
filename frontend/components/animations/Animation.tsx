"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

type AnimationProps = {
  children: ReactNode;
  delay?: number;
};

export const ScrollFadeIn = ({ children, delay = 0 }: AnimationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export const FadeInCard = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

export const FadeUpOnScroll = ({ children }: { children: ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="fade-up-item"
    >
      {children}
    </motion.div>
  );
};

export const ZoomAnimation = ({ children }: { children: ReactNode }) => {
  return (
    <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.8 }}>
      {children}
    </motion.div>
  );
};
