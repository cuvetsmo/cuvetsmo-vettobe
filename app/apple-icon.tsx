import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fbf6e9",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 40 40"
          fill="none"
        >
          <circle cx="20" cy="20" r="18" fill="#f4d4c5" />
          <path
            d="M12 14c0 6 4 10 8 10s8-4 8-10"
            stroke="#c44827"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="12" cy="14" r="3" fill="#c44827" />
          <circle cx="28" cy="14" r="3" fill="#c44827" />
          <path
            d="M20 24v4M18 29h4"
            stroke="#5d8348"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
