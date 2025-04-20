import type React from "react"

export const LicenseIcon = ({ size = 24, ...props }: { size?: number } & React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="15" x2="8" y2="15" />
      <line x1="12" y1="15" x2="17" y2="15" />
    </svg>
  )
}
