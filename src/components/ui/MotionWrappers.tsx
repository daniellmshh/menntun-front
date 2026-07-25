"use client";

import React from "react";
import { motion, Variants } from "framer-motion";

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

export function StaggerContainer({ children, className, as: Component = "div", id }: { children: React.ReactNode; className?: string; as?: any; id?: string }) {
  const MotionComponent = motion(Component as any);
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

export function FadeUp({ children, className, as: Component = "div" }: { children: React.ReactNode; className?: string; as?: any }) {
  const MotionComponent = motion(Component as any);
  return (
    <MotionComponent variants={fadeUpVariants} className={className}>
      {children}
    </MotionComponent>
  );
}

export function FadeLeft({ children, className, as: Component = "div" }: { children: React.ReactNode; className?: string; as?: any }) {
  const MotionComponent = motion(Component as any);
  return (
    <MotionComponent variants={fadeLeftVariants} className={className}>
      {children}
    </MotionComponent>
  );
}

export function FadeRight({ children, className, as: Component = "div" }: { children: React.ReactNode; className?: string; as?: any }) {
  const MotionComponent = motion(Component as any);
  return (
    <MotionComponent variants={fadeRightVariants} className={className}>
      {children}
    </MotionComponent>
  );
}
