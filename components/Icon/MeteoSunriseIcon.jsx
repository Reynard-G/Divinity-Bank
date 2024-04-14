export default function MeteoSunriseIcon(props) {
  return (
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' {...props}>
      <defs>
        <linearGradient
          id='a'
          x1={150}
          x2={234}
          y1={119.2}
          y2={264.8}
          gradientUnits='userSpaceOnUse'
        >
          <stop offset={0} stopColor='#fbbf24' />
          <stop offset={0.5} stopColor='#fbbf24' />
          <stop offset={1} stopColor='#f59e0b' />
        </linearGradient>
        <clipPath id='b'>
          <path
            fill='none'
            d='M512 306H304l-35.9-31.4a18.4 18.4 0 0 0-24.2 0L208 306H0V0h512Z'
          />
        </clipPath>
        <symbol id='c' viewBox='0 0 384 384'>
          <circle
            cx={192}
            cy={192}
            r={84}
            fill='url(#a)'
            stroke='#f8af18'
            strokeMiterlimit={10}
            strokeWidth={6}
          />
          <path
            fill='none'
            stroke='#fbbf24'
            strokeLinecap='round'
            strokeMiterlimit={10}
            strokeWidth={24}
            d='M192 61.7V12m0 360v-49.7m92.2-222.5 35-35M64.8 319.2l35.1-35.1m0-184.4-35-35m254.5 254.5-35.1-35.1M61.7 192H12m360 0h-49.7'
          >
            <animateTransform
              additive='sum'
              attributeName='transform'
              dur='6s'
              repeatCount='indefinite'
              type='rotate'
              values='0 192 192; 45 192 192'
            />
          </path>
        </symbol>
      </defs>
      <g clipPath='url(#b)'>
        <use width={384} height={384} href='#c' transform='translate(64 100)' />
      </g>
      <path
        fill='none'
        stroke='#374151'
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={18}
        d='M128 332h88l40-36 40 36h88'
      />
    </svg>
  );
}