export function SonarLogo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
    >
      <circle cx="20" cy="20" r="3" fill="var(--color-signal)" />
      <circle
        className="sonar-ring"
        cx="20"
        cy="20"
        r="8"
        stroke="var(--color-signal)"
        strokeWidth="1.2"
        fill="none"
        opacity="0.7"
        style={{ animationDelay: "0s" }}
      />
      <circle
        className="sonar-ring"
        cx="20"
        cy="20"
        r="13"
        stroke="var(--color-signal)"
        strokeWidth="1"
        fill="none"
        opacity="0.5"
        style={{ animationDelay: "0.6s" }}
      />
      <circle
        className="sonar-ring"
        cx="20"
        cy="20"
        r="18"
        stroke="var(--color-signal)"
        strokeWidth="0.8"
        fill="none"
        opacity="0.35"
        style={{ animationDelay: "1.2s" }}
      />
    </svg>
  );
}
