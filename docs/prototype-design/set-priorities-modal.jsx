// set-priorities-modal.jsx — first-login onboarding for life-area priorities.
// User distributes a fixed budget (default 30) across 7 areas; saves and locks.

const PRIORITY_INFO = {
  health: "Physical and mental wellbeing — sleep, exercise, nutrition, energy.",
  career: "Work, learning, and professional growth — the things you build during the day.",
  finances: "Money — earning, saving, investing, and feeling secure with what you have.",
  relationships: "Family, friends, partner — the people you want to show up for.",
  personal: "Personal growth — hobbies, skills, and becoming who you want to be.",
  fun: "Play, leisure, and joy — what recharges you outside of duty.",
  spirituality:
    "Meaning and purpose — values, reflection, faith, or connection to something bigger.",
};

function PriorityRow({ area, value, canIncrement, onChange, infoOpen, onToggleInfo }) {
  const disabledMinus = value <= 0;
  const disabledPlus = !canIncrement;

  const btnBase = {
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: "none",
    fontFamily: "inherit",
    fontSize: 18,
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
    lineHeight: 1,
    transition: "transform .08s, background .15s",
  };

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #EAEDE8",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            flexShrink: 0,
            background: area.color + "22",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 17,
          }}
        >
          {area.icon}
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#1C2B20" }}>{area.label}</span>
            <button
              onClick={onToggleInfo}
              aria-label={`About ${area.label}`}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "none",
                background: infoOpen ? "#3A6647" : "#E8EDE5",
                color: infoOpen ? "#fff" : "#7A8A7A",
                fontFamily: "inherit",
                fontSize: 11,
                fontWeight: 800,
                cursor: "pointer",
                padding: 0,
                lineHeight: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              i
            </button>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => !disabledMinus && onChange(value - 1)}
            disabled={disabledMinus}
            style={{
              ...btnBase,
              background: disabledMinus ? "#F1F4F0" : "#E8F0E8",
              color: disabledMinus ? "#C8D0C8" : "#3A6647",
              cursor: disabledMinus ? "default" : "pointer",
            }}
          >
            −
          </button>
          <div
            style={{
              minWidth: 28,
              textAlign: "center",
              fontSize: 17,
              fontWeight: 800,
              color: "#1C2B20",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
          <button
            onClick={() => !disabledPlus && onChange(value + 1)}
            disabled={disabledPlus}
            style={{
              ...btnBase,
              background: disabledPlus ? "#F1F4F0" : "#3A6647",
              color: disabledPlus ? "#C8D0C8" : "#fff",
              cursor: disabledPlus ? "default" : "pointer",
            }}
          >
            +
          </button>
        </div>
      </div>

      {infoOpen && (
        <div
          style={{
            marginTop: 8,
            padding: "8px 10px",
            background: "#F4F7F0",
            borderRadius: 9,
            fontSize: 12,
            lineHeight: 1.45,
            color: "#5A6A5A",
          }}
        >
          {PRIORITY_INFO[area.key]}
        </div>
      )}
    </div>
  );
}

function SetPrioritiesModal({ totalBudget = 30, initial, onSave }) {
  const areas = window.WHEEL_AREAS || [];
  const [values, setValues] = React.useState(() => {
    const seed = {};
    areas.forEach((a) => {
      seed[a.key] = (initial && initial[a.key]) || 0;
    });
    return seed;
  });
  const [openInfo, setOpenInfo] = React.useState(null);

  const used = Object.values(values).reduce((a, b) => a + b, 0);
  const remaining = totalBudget - used;
  const canSave = remaining === 0;

  function setVal(key, v) {
    if (v < 0) return;
    const newUsed = used - values[key] + v;
    if (newUsed > totalBudget) return;
    setValues((prev) => ({ ...prev, [key]: v }));
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 300,
        background: "rgba(28,43,32,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxHeight: "92%",
          background: "#F4F7F0",
          borderRadius: "24px 24px 0 0",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{ padding: "18px 18px 12px", flexShrink: 0, position: "relative" }}>
          <div
            style={{
              width: 38,
              height: 4,
              background: "#D6DDD2",
              borderRadius: 2,
              margin: "0 auto 14px",
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#1C2B20", textAlign: "center" }}>
            Set your priorities
          </div>
          <div
            style={{
              fontSize: 12.5,
              color: "#5A6A5A",
              lineHeight: 1.5,
              textAlign: "center",
              marginTop: 6,
              padding: "0 4px",
            }}
          >
            You have <b style={{ color: "#3A6647" }}>{totalBudget} points</b> to invest across the
            seven areas of your life. Spend them on what matters most to you right now — these
            priorities shape your garden and stay locked in for a while, so be intentional.
          </div>

          {/* Budget pill */}
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                background: canSave ? "#3A6647" : "#fff",
                border: canSave ? "1.5px solid #3A6647" : "1.5px solid #C8D6C8",
                color: canSave ? "#fff" : "#1C2B20",
                fontSize: 13,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background .2s, color .2s",
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  opacity: 0.75,
                  letterSpacing: 0.4,
                  textTransform: "uppercase",
                }}
              >
                Budget left
              </span>
              <span
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  fontVariantNumeric: "tabular-nums",
                  lineHeight: 1,
                }}
              >
                {remaining}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable list */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "4px 14px 12px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {areas.map((a) => (
            <PriorityRow
              key={a.key}
              area={a}
              value={values[a.key] || 0}
              canIncrement={remaining > 0}
              onChange={(v) => setVal(a.key, v)}
              infoOpen={openInfo === a.key}
              onToggleInfo={() => setOpenInfo((prev) => (prev === a.key ? null : a.key))}
            />
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            flexShrink: 0,
            padding: "12px 16px 22px",
            background: "#F4F7F0",
            borderTop: "1px solid #E8EDE5",
          }}
        >
          <button
            onClick={() => canSave && onSave(values)}
            disabled={!canSave}
            style={{
              width: "100%",
              padding: "14px",
              background: canSave ? "#3A6647" : "#D6DDD2",
              color: canSave ? "#fff" : "#8A988A",
              border: "none",
              borderRadius: 14,
              fontFamily: "inherit",
              fontSize: 15,
              fontWeight: 800,
              cursor: canSave ? "pointer" : "not-allowed",
              boxShadow: canSave ? "0 4px 12px rgba(58,102,71,0.28)" : "none",
              transition: "background .15s, transform .08s",
            }}
          >
            {canSave
              ? "🔒  Save and lock my priorities"
              : `Allocate ${remaining} more point${remaining === 1 ? "" : "s"}`}
          </button>
          <p
            style={{
              fontSize: 11,
              color: "#9EB09E",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 1.4,
            }}
          >
            Once saved, your priorities are locked in. You can revisit them later from your profile.
          </p>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SetPrioritiesModal });
