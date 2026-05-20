import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#f4d4c5",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 40 40"
          fill="none"
        >
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
