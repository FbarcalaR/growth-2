// LoginPage component — exported to window
function LoginPage({ onLogin }) {
  const [name, setName] = React.useState("");
  const [step, setStep] = React.useState("welcome"); // 'welcome' | 'name'

  function handleStart() {
    if (step === "welcome") {
      setStep("name");
      return;
    }
    if (name.trim()) onLogin(name.trim());
  }

  const GardenIllustration = () => (
    <svg
      viewBox="0 0 280 160"
      width="280"
      height="160"
      style={{ display: "block", margin: "0 auto" }}
    >
      {/* Sky */}
      <rect width="280" height="160" fill="#F0F7E8" />
      {/* Sun */}
      <circle cx="240" cy="30" r="20" fill="#FDD835" opacity="0.7" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={240 + 22 * Math.cos(r)}
            y1={30 + 22 * Math.sin(r)}
            x2={240 + 30 * Math.cos(r)}
            y2={30 + 30 * Math.sin(r)}
            stroke="#FDD835"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.5"
          />
        );
      })}
      {/* Ground */}
      <ellipse cx="140" cy="148" rx="130" ry="18" fill="#C8E6C9" />
      <ellipse cx="140" cy="145" rx="120" ry="14" fill="#A5D6A7" />
      {/* Path */}
      <ellipse cx="140" cy="148" rx="20" ry="8" fill="#D7CCC8" />
      {/* Oak tree left */}
      <rect x="38" y="95" width="8" height="50" rx="3" fill="#5D4037" />
      <circle cx="42" cy="76" r="24" fill="#2E7D32" />
      <circle cx="30" cy="82" r="16" fill="#388E3C" />
      <circle cx="54" cy="80" r="16" fill="#388E3C" />
      <circle cx="42" cy="62" r="14" fill="#43A047" />
      {/* Cherry blossom right */}
      <rect x="218" y="100" width="6" height="45" rx="2" fill="#9E9E9E" />
      <circle cx="200" cy="85" r="18" fill="#F48FB1" />
      <circle cx="218" cy="78" r="17" fill="#F06292" />
      <circle cx="233" cy="88" r="15" fill="#F48FB1" />
      <circle cx="218" cy="67" r="14" fill="#FCE4EC" />
      {/* Tulip center */}
      <line x1="140" y1="138" x2="140" y2="110" stroke="#4CAF50" strokeWidth="2.5" />
      <path d="M140,110 C134,102 132,94 140,88 C148,94 146,102 140,110Z" fill="#E91E63" />
      {/* Daisy left-center */}
      <line x1="110" y1="138" x2="110" y2="116" stroke="#4CAF50" strokeWidth="2" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <ellipse
            key={a}
            cx={110 + Math.cos(r) * 7}
            cy={112 + Math.sin(r) * 7}
            rx="3"
            ry="5"
            fill="white"
            transform={`rotate(${a},${110 + Math.cos(r) * 7},${112 + Math.sin(r) * 7})`}
          />
        );
      })}
      <circle cx="110" cy="112" r="4" fill="#FDD835" />
      {/* Mushroom right-center */}
      <rect x="167" y="128" width="8" height="12" rx="2" fill="#D7CCC8" />
      <ellipse cx="171" cy="127" rx="12" ry="9" fill="#EF5350" />
      <circle cx="167" cy="124" r="2" fill="white" />
      <circle cx="174" cy="122" r="2" fill="white" />
      {/* Grass tufts */}
      {[60, 85, 160, 185, 210, 240].map((x) => (
        <g key={x}>
          <line
            x1={x}
            y1="145"
            x2={x - 4}
            y2="134"
            stroke="#66BB6A"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1="145"
            x2={x}
            y2="132"
            stroke="#4CAF50"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1={x}
            y1="145"
            x2={x + 4}
            y2="135"
            stroke="#66BB6A"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );

  return (
    <div
      style={{
        height: "100%",
        background: "linear-gradient(160deg, #F0F7E8 0%, #E8F5E9 60%, #F1F8E9 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 32px",
        fontFamily: "inherit",
        boxSizing: "border-box",
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 340 }}>
        {/* Logo */}
        <div style={{ marginBottom: 8 }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="26" fill="#3A6647" />
            <path
              d="M26,40 C26,40 14,30 14,20 C14,14 20,10 26,16 C32,10 38,14 38,20 C38,30 26,40 26,40Z"
              fill="#66BB6A"
            />
            <path
              d="M26,40 C26,40 20,30 22,20 C23,15 26,16 26,16 C26,16 29,15 30,20 C32,30 26,40 26,40Z"
              fill="#A5D6A7"
            />
            <line
              x1="26"
              y1="40"
              x2="26"
              y2="44"
              stroke="#A5D6A7"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: "#1C2B20",
            margin: "0 0 6px",
            letterSpacing: "-0.5px",
          }}
        >
          Bloomly
        </h1>
        <p style={{ fontSize: 15, color: "#6B7F70", margin: "0 0 28px", fontWeight: 400 }}>
          {step === "welcome"
            ? "Grow your best life, one task at a time."
            : "What should we call you?"}
        </p>

        <GardenIllustration />

        <div style={{ marginTop: 28 }}>
          {step === "name" && (
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleStart()}
              placeholder="Your name…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "14px 18px",
                border: "2px solid #C8E6C9",
                borderRadius: 16,
                fontSize: 16,
                fontFamily: "inherit",
                background: "#fff",
                color: "#1C2B20",
                outline: "none",
                marginBottom: 12,
                transition: "border .2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3A6647")}
              onBlur={(e) => (e.target.style.borderColor = "#C8E6C9")}
            />
          )}
          <button
            onClick={handleStart}
            style={{
              width: "100%",
              padding: "15px",
              borderRadius: 16,
              border: "none",
              background: "#3A6647",
              color: "white",
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 0.2,
              transition: "transform .15s, background .15s",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.97)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {step === "welcome"
              ? "Start Growing →"
              : name.trim()
                ? `Let's go, ${name.split(" ")[0]}! 🌱`
                : "Continue →"}
          </button>
        </div>

        <p style={{ fontSize: 12, color: "#A8BCA8", marginTop: 20 }}>
          No account needed · Your data stays on this device
        </p>
      </div>
    </div>
  );
}

Object.assign(window, { LoginPage });
