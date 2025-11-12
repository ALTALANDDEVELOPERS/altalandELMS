
import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const AtaLogo: React.FC<IconProps> = (props) => (
    <svg {...props} viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 5 L95 90 L5 90 Z" />
    </svg>
);

export const Mic: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

export const User: React.FC<IconProps> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const X: React.FC<IconProps> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
);

// FIX: Add Bot icon for Chatbot component.
export const Bot: React.FC<IconProps> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
);

// FIX: Add Send icon for Chatbot component.
export const Send: React.FC<IconProps> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="m22 2-11 11" />
    </svg>
);

export const BrainCircuit: React.FC<IconProps> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M12 5a3 3 0 1 0-5.993.142" />
        <path d="M18 13a3 3 0 1 0-5.993.142" />
        <path d="M5 13a3 3 0 1 0-5.993.142" />
        <path d="M12 21a3 3 0 1 0-5.993-.142" />
        <path d="M18 5a3 3 0 1 0-5.993.142" />
        <path d="M5 5a3 3 0 1 0-5.993.142" />
        <path d="M12 13a3 3 0 1 0-5.993.142" />
        <path d="M18 21a3 3 0 1 0-5.993-.142" />
        <path d="M9 5h-1" />
        <path d="M15 5h-1" />
        <path d="M21 5h-1" />
        <path d="M3 5h-1" />
        <path d="M9 13H8" />
        <path d="M15 13h-1" />
        <path d="M21 13h-1" />
        <path d="M3 13H2" />
        <path d="M9 21h-1" />
        <path d="M15 21h-1" />
        <path d="M21 21h-1" />
        <path d="M3 21h-1" />
        <path d="M6 8V7" />
        <path d="M12 8V7" />
        <path d="M18 8V7" />
        <path d="M6 16v-1" />
        <path d="M12 16v-1" />
        <path d="M18 16v-1" />
    </svg>
);

export const Sparkles: React.FC<IconProps> = (props) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M12 3L9.5 8.5L4 11l5.5 2.5L12 19l2.5-5.5L20 11l-5.5-2.5z" />
        <path d="M3 21l2.5-5.5L8 13l-5.5-2.5z" />
        <path d="M21 3l-2.5 5.5L16 11l5.5 2.5z" />
    </svg>
);

export const Calendar: React.FC<IconProps> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

export const ChevronLeft: React.FC<IconProps> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m15 18-6-6 6-6" />
    </svg>
);

export const ChevronRight: React.FC<IconProps> = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m9 18 6-6-6-6" />
    </svg>
);
