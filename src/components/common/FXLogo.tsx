import React from 'react';

interface FXLogoProps {
  size?: number;
}

export const FXLogo: React.FC<FXLogoProps> = ({ size = 80 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="orangeArc" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#f7b733" />
        <stop offset="100%" stopColor="#e07b14" />
      </linearGradient>
    </defs>

    {/* White background circle */}
    <circle cx="50" cy="50" r="44" fill="white" />

    {/* Orange swirling arc — sweeps counterclockwise from lower-left to upper-right */}
    <path
      d="M 14 78 A 48 48 0 1 0 80 14"
      fill="none"
      stroke="url(#orangeArc)"
      strokeWidth="7"
      strokeLinecap="round"
    />

    {/* Green bowl at bottom */}
    <ellipse cx="50" cy="70" rx="20" ry="10" fill="#8dc63f" />

    {/* Purple / violet left leaf */}
    <ellipse
      cx="39"
      cy="53"
      rx="9"
      ry="20"
      fill="#8b3088"
      transform="rotate(-28 39 53)"
    />

    {/* Green center leaf */}
    <ellipse
      cx="51"
      cy="49"
      rx="8"
      ry="19"
      fill="#4caf50"
      transform="rotate(5 51 49)"
    />

    {/* Red right leaf */}
    <ellipse
      cx="63"
      cy="54"
      rx="7"
      ry="16"
      fill="#c0281f"
      transform="rotate(30 63 54)"
    />
  </svg>
);
