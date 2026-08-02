"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

type MotionTag = "div" | "section" | "h1" | "h2" | "p";

interface MotionWrapperProps {
  children: React.ReactNode;
  className?: string;
  as?: MotionTag;
}

// `m` only provides animation features when it is paired with LazyMotion.
// The landing renders outside that provider, so using it left every section
// at its initial `hidden` variant after hydration. Keep the full `motion`
// factory and map the allowed semantic tags explicitly to preserve typing.
const motionComponents = {
  div: motion.div,
  section: motion.section,
  h1: motion.h1,
  h2: motion.h2,
  p: motion.p,
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeLeftVariants: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeRightVariants: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export function StaggerContainer({
  children,
  className,
  as = "div",
  id,
}: MotionWrapperProps & { id?: string }) {
  const MotionComponent = motionComponents[as];
  return (
    <MotionComponent
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </MotionComponent>
  );
}

export function FadeUp({ children, className, as = "div" }: MotionWrapperProps) {
  const MotionComponent = motionComponents[as];
  return (
    <MotionComponent variants={fadeUpVariants} className={className}>
      {children}
    </MotionComponent>
  );
}

export function FadeLeft({ children, className, as = "div" }: MotionWrapperProps) {
  const MotionComponent = motionComponents[as];
  return (
    <MotionComponent variants={fadeLeftVariants} className={className}>
      {children}
    </MotionComponent>
  );
}

export function FadeRight({ children, className, as = "div" }: MotionWrapperProps) {
  const MotionComponent = motionComponents[as];
  return (
    <MotionComponent variants={fadeRightVariants} className={className}>
      {children}
    </MotionComponent>
  );
}
