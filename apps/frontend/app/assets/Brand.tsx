import type { SVGProps } from "react";

const SvgBrand = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 400 400"
    {...props}
  >
    <path
      fill="url(#brand_svg__a)"
      d="M275 50H125c-41.421 0-75 33.579-75 75v90c0 25.859 13.087 48.662 33 62.146v71.427c0 .947 1.115 1.453 1.828.831L118.5 320l33.5-30h123c41.421 0 75-33.579 75-75v-90c0-41.421-33.579-75-75-75"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M35 125c0-49.706 40.294-90 90-90h150c49.706 0 90 40.294 90 90v90c0 49.706-40.294 90-90 90H157.735l-29.228 26.174-.141.124-33.671 29.404C84.278 369.797 68 362.4 68 348.573v-63.922C47.878 268.165 35 243.088 35 215zm90-60c-33.137 0-60 26.863-60 60v90c0 20.674 10.443 38.913 26.41 49.726a15 15 0 0 1 6.59 12.42v40.841l10.563-9.223 33.43-29.938A15 15 0 0 1 152 275h123c33.137 0 60-26.863 60-60v-90c0-33.137-26.863-60-60-60z"
      clipRule="evenodd"
    />
    <circle cx={138} cy={176} r={25} fill="#5C0000" fillOpacity={0.25} />
    <circle cx={204} cy={176} r={25} fill="#5C0000" fillOpacity={0.25} />
    <circle cx={270} cy={176} r={25} fill="#5C0000" fillOpacity={0.25} />
    <circle cx={134} cy={169} r={23} fill="#fff" />
    <circle cx={200} cy={169} r={23} fill="#fff" />
    <circle cx={266} cy={169} r={23} fill="#fff" />
    <defs>
      <linearGradient
        id="brand_svg__a"
        x1={136.5}
        x2={327.557}
        y1={0}
        y2={360.718}
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#FD3E31" />
        <stop offset={0.425} stopColor="#FD3E31" />
        <stop offset={1} stopColor="#550A04" />
      </linearGradient>
    </defs>
  </svg>
);
export default SvgBrand;
