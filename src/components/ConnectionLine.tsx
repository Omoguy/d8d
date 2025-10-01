import React from 'react';

interface ConnectionLineProps {
  start: { x: number; y: number };
  end: { x: number; y: number };
  isSelected: boolean;
  isTemp?: boolean;
  onClick: () => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  start,
  end,
  isSelected,
  isTemp = false,
  onClick,
}) => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  const controlPointOffset = Math.min(Math.abs(dx) * 0.5, 100);

  const cp1x = start.x + controlPointOffset;
  const cp1y = start.y;
  const cp2x = end.x - controlPointOffset;
  const cp2y = end.y;

  const path = `M ${start.x} ${start.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${end.x} ${end.y}`;

  return (
    <g onClick={onClick} className={isTemp ? '' : 'cursor-pointer'}>
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth="20"
        className="pointer-events-auto"
      />
      <path
        d={path}
        fill="none"
        stroke={isTemp ? '#94a3b8' : isSelected ? '#3b82f6' : '#64748b'}
        strokeWidth="2"
        strokeDasharray={isTemp ? '5,5' : '0'}
        className="pointer-events-none"
      />
      {!isTemp && (
        <>
          <circle
            cx={start.x}
            cy={start.y}
            r="4"
            fill="#64748b"
            className="pointer-events-none"
          />
          <circle
            cx={end.x}
            cy={end.y}
            r="4"
            fill="#64748b"
            className="pointer-events-none"
          />
        </>
      )}
    </g>
  );
};

export default ConnectionLine;
