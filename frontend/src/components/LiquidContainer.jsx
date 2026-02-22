import { motion } from 'framer-motion';

const LiquidContainer = ({ fillPercent = 0, type = 'oil', size = 'large' }) => {
  const isOil = type === 'oil';

  const fillColor = isOil ? '#F59E0B' : '#A8A29E';
  const lightColor = isOil ? '#FCD34D' : '#E7E5E4';

  const dimensions =
    size === 'large'
      ? { width: 140, height: 200 }
      : { width: 80, height: 120 };

  const fillHeight = Math.min(
    (fillPercent / 50) * (dimensions.height * 0.7),
    dimensions.height * 0.7
  );

  const baseY = dimensions.height * 0.85;

  return (
    <div className="relative flex flex-col items-center">
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="drop-shadow-lg"
      >
        {/* Container body */}
        <defs>
          <clipPath id={`container-clip-${type}-${size}`}>
            <path
              d={`
                M ${dimensions.width * 0.25} ${dimensions.height * 0.15}
                L ${dimensions.width * 0.2} ${dimensions.height * 0.85}
                Q ${dimensions.width * 0.2} ${dimensions.height * 0.95} ${dimensions.width * 0.3} ${dimensions.height * 0.95}
                L ${dimensions.width * 0.7} ${dimensions.height * 0.95}
                Q ${dimensions.width * 0.8} ${dimensions.height * 0.95} ${dimensions.width * 0.8} ${dimensions.height * 0.85}
                L ${dimensions.width * 0.75} ${dimensions.height * 0.15}
                Z
              `}
            />
          </clipPath>

          <linearGradient
            id={`liquid-gradient-${type}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="100%" stopColor={fillColor} />
          </linearGradient>
        </defs>

        {/* Glass container */}
        <path
          d={`
            M ${dimensions.width * 0.25} ${dimensions.height * 0.15}
            L ${dimensions.width * 0.2} ${dimensions.height * 0.85}
            Q ${dimensions.width * 0.2} ${dimensions.height * 0.95} ${dimensions.width * 0.3} ${dimensions.height * 0.95}
            L ${dimensions.width * 0.7} ${dimensions.height * 0.95}
            Q ${dimensions.width * 0.8} ${dimensions.height * 0.95} ${dimensions.width * 0.8} ${dimensions.height * 0.85}
            L ${dimensions.width * 0.75} ${dimensions.height * 0.15}
            Z
          `}
          fill="white"
          fillOpacity="0.3"
          stroke="#E7E5E4"
          strokeWidth="2"
        />

        {/* Liquid fill with animation */}
        <g clipPath={`url(#container-clip-${type}-${size})`}>
          <motion.rect
            x={dimensions.width * 0.2}
            initial={{ y: baseY, height: 0 }}
            animate={{
              y: baseY - fillHeight,
              height: fillHeight,
            }}
            transition={{ duration: 1, ease: 'easeOut' }}
            width={dimensions.width * 0.6}
            fill={`url(#liquid-gradient-${type})`}
          />

          {/* Wave effect */}
          {fillPercent > 0 && (
            <motion.ellipse
              cx={dimensions.width * 0.5}
              initial={{ cy: baseY }}
              animate={{ cy: baseY - fillHeight }}
              transition={{ duration: 1, ease: 'easeOut' }}
              rx={dimensions.width * 0.3}
              ry={6}
              fill={lightColor}
            />
          )}
        </g>

        {/* Neck */}
        <rect
          x={dimensions.width * 0.35}
          y={dimensions.height * 0.05}
          width={dimensions.width * 0.3}
          height={dimensions.height * 0.12}
          rx="4"
          fill="white"
          fillOpacity="0.4"
          stroke="#E7E5E4"
          strokeWidth="2"
        />

        {/* Cap */}
        <rect
          x={dimensions.width * 0.32}
          y={dimensions.height * 0.02}
          width={dimensions.width * 0.36}
          height={dimensions.height * 0.05}
          rx="4"
          fill={isOil ? '#10B981' : '#EC4899'}
        />
      </svg>

      {/* Label */}
      <div className="mt-2 text-center">
        <p className="font-outfit font-bold text-lg text-stone-800">
          {typeof fillPercent === 'number'
            ? fillPercent.toFixed(1)
            : '0.0'}
          L
        </p>
        <p className="text-xs text-stone-500 uppercase tracking-wide">
        </p>
      </div>
    </div>
  );
};

export default LiquidContainer;