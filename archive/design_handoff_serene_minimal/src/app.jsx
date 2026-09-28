// Main app — direction switcher + view switcher + tweaks wiring

const { useState, useEffect, useMemo } = React;

// Per-direction CSS variables. Each palette is a list of options.
const DIRECTIONS = {
  1: {
    key: "serene",
    name: "Serene Minimal",
    palettes: [
      { name: "Sage",      vars: { "--s-bg": "#f3efe7", "--s-ink": "#1a1915", "--s-accent": "#6b7a4a" } },
      { name: "Ochre",     vars: { "--s-bg": "#f4ede0", "--s-ink": "#1a1915", "--s-accent": "#b37a2a" } },
      { name: "Indigo",    vars: { "--s-bg": "#eeeae2", "--s-ink": "#14131a", "--s-accent": "#3d4a7a" } },
      { name: "Clay",      vars: { "--s-bg": "#f1e9e0", "--s-ink": "#201815", "--s-accent": "#a04a34" } },
    ],
    typos: {
      default: { "--s-display": "'Instrument Serif', serif", "--s-body": "'Inter', system-ui, sans-serif", "--s-mono": "'JetBrains Mono', monospace" },
      serif:   { "--s-display": "'Fraunces', serif", "--s-body": "'Crimson Pro', serif", "--s-mono": "'JetBrains Mono', monospace" },
      grotesk: { "--s-display": "'Space Grotesk', sans-serif", "--s-body": "'Space Grotesk', sans-serif", "--s-mono": "'JetBrains Mono', monospace" },
      mono:    { "--s-display": "'JetBrains Mono', monospace", "--s-body": "'JetBrains Mono', monospace", "--s-mono": "'JetBrains Mono', monospace" },
    },
    comps: { home: "SereneLanding", feature: "SereneFeature", dashboard: "SereneDashboard" },
  },
  2: {
    key: "editorial",
    name: "Editorial Bold",
    palettes: [
      { name: "Electric",  vars: { "--e-bg": "#ecece6", "--e-ink": "#0a0a0a", "--e-accent": "#3a5bff" } },
      { name: "Blood",     vars: { "--e-bg": "#f0ece4", "--e-ink": "#0a0a0a", "--e-accent": "#d6322e" } },
      { name: "Acid",      vars: { "--e-bg": "#ecece6", "--e-ink": "#0a0a0a", "--e-accent": "#c9d43a" } },
      { name: "Mono",      vars: { "--e-bg": "#ecece6", "--e-ink": "#0a0a0a", "--e-accent": "#0a0a0a" } },
    ],
    typos: {
      default: { "--e-display": "'Fraunces', serif", "--e-body": "'DM Sans', sans-serif", "--e-mono": "'JetBrains Mono', monospace" },
      serif:   { "--e-display": "'Crimson Pro', serif", "--e-body": "'Crimson Pro', serif", "--e-mono": "'JetBrains Mono', monospace" },
      grotesk: { "--e-display": "'Space Grotesk', sans-serif", "--e-body": "'Space Grotesk', sans-serif", "--e-mono": "'JetBrains Mono', monospace" },
      mono:    { "--e-display": "'JetBrains Mono', monospace", "--e-body": "'JetBrains Mono', monospace", "--e-mono": "'JetBrains Mono', monospace" },
    },
    comps: { home: "EditorialLanding", feature: "EditorialFeature", dashboard: "EditorialDashboard" },
  },
  3: {
    key: "organic",
    name: "Organic Warm",
    palettes: [
      { name: "Terracotta", vars: { "--o-bg": "#f6ece0", "--o-ink": "#2d211a", "--o-accent": "#c65d3a" } },
      { name: "Moss",       vars: { "--o-bg": "#eef0e6", "--o-ink": "#1f2a1e", "--o-accent": "#6b8a52" } },
      { name: "Plum",       vars: { "--o-bg": "#f1eaed", "--o-ink": "#2a1d28", "--o-accent": "#8f4a6a" } },
      { name: "Sunflower",  vars: { "--o-bg": "#f5ecda", "--o-ink": "#2d2518", "--o-accent": "#d69a2a" } },
    ],
    typos: {
      default: { "--o-display": "'Fraunces', serif", "--o-body": "'DM Sans', sans-serif" },
      serif:   { "--o-display": "'Instrument Serif', serif", "--o-body": "'Crimson Pro', serif" },
      grotesk: { "--o-display": "'Space Grotesk', sans-serif", "--o-body": "'Space Grotesk', sans-serif" },
      mono:    { "--o-display": "'JetBrains Mono', monospace", "--o-body": "'JetBrains Mono', monospace" },
    },
    comps: { home: "OrganicLanding", feature: "OrganicFeature", dashboard: "OrganicDashboard" },
  },
  4: {
    key: "brutalist",
    name: "Neo-Brutalist Calm",
    palettes: [
      { name: "Ochre",     vars: { "--b-bg": "#e8e4d8", "--b-ink": "#1f1a24", "--b-accent": "#c68a3a" } },
      { name: "Aubergine", vars: { "--b-bg": "#e3e0d6", "--b-ink": "#2a1f3a", "--b-accent": "#9a4a6a" } },
      { name: "Lichen",    vars: { "--b-bg": "#e0e2d4", "--b-ink": "#1a2218", "--b-accent": "#6b8a3a" } },
      { name: "Oxblood",   vars: { "--b-bg": "#e8e0d4", "--b-ink": "#1a1414", "--b-accent": "#8a3a2a" } },
    ],
    typos: {
      default: { "--b-display": "'Libre Caslon Condensed', serif", "--b-body": "'JetBrains Mono', monospace" },
      serif:   { "--b-display": "'Fraunces', serif", "--b-body": "'Crimson Pro', serif" },
      grotesk: { "--b-display": "'Space Grotesk', sans-serif", "--b-body": "'Space Grotesk', sans-serif" },
      mono:    { "--b-display": "'JetBrains Mono', monospace", "--b-body": "'JetBrains Mono', monospace" },
    },
    comps: { home: "BrutalistLanding", feature: "BrutalistFeature", dashboard: "BrutalistDashboard" },
  },
};

function App() {
  const [dir, setDir] = useState(1);
  const [view, setView] = useState("home");
  const [paletteIdx, setPaletteIdx] = useState(window.TWEAK_DEFAULTS?.paletteIndex || 0);
  const [typo, setTypo] = useState(window.TWEAK_DEFAULTS?.typo || "default");
  const [density, setDensity] = useState(window.TWEAK_DEFAULTS?.density || "comfortable");

  const cfg = DIRECTIONS[dir];
  const palette = cfg.palettes[paletteIdx % cfg.palettes.length];

  // apply CSS variables to stage
  useEffect(() => {
    const stage = document.getElementById("stage");
    if (!stage) return;
    Object.entries(palette.vars).forEach(([k,v]) => stage.style.setProperty(k, v));
    Object.entries(cfg.typos[typo] || {}).forEach(([k,v]) => stage.style.setProperty(k, v));
    stage.setAttribute("data-density", density);
  }, [dir, paletteIdx, typo, density, cfg, palette]);

  // sidebar click wiring
  useEffect(() => {
    const dirBtns = document.querySelectorAll(".nav-dir[data-dir]");
    dirBtns.forEach(b => {
      b.onclick = () => {
        setDir(Number(b.dataset.dir));
        setPaletteIdx(0);
        dirBtns.forEach(x => x.classList.remove("is-active"));
        b.classList.add("is-active");
      };
      b.classList.toggle("is-active", Number(b.dataset.dir) === dir);
    });
    const viewBtns = document.querySelectorAll(".nav-dir[data-view]");
    viewBtns.forEach(b => {
      b.onclick = () => {
        setView(b.dataset.view);
        viewBtns.forEach(x => x.classList.remove("is-active"));
        b.classList.add("is-active");
      };
      b.classList.toggle("is-active", b.dataset.view === view);
    });
  }, [dir, view]);

  // tweaks controls
  useEffect(() => {
    // palette swatches
    const wrap = document.getElementById("sw-palette");
    if (!wrap) return;
    wrap.innerHTML = "";
    cfg.palettes.forEach((p, i) => {
      const btn = document.createElement("button");
      btn.className = "sw" + (i === paletteIdx ? " is-active" : "");
      btn.title = p.name;
      btn.style.background = Object.values(p.vars)[2]; // accent
      btn.onclick = () => {
        setPaletteIdx(i);
        window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { paletteIndex: i } }, "*");
      };
      wrap.appendChild(btn);
    });

    const selTypo = document.getElementById("sel-typo");
    if (selTypo) {
      selTypo.value = typo;
      selTypo.onchange = (e) => {
        setTypo(e.target.value);
        window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { typo: e.target.value } }, "*");
      };
    }
    const selDensity = document.getElementById("sel-density");
    if (selDensity) {
      selDensity.value = density;
      selDensity.onchange = (e) => {
        setDensity(e.target.value);
        window.parent.postMessage({ type: "__edit_mode_set_keys", edits: { density: e.target.value } }, "*");
      };
    }
  }, [dir, paletteIdx, typo, density, cfg]);

  // pick component
  const compName = cfg.comps[view];
  const Comp =
    (window.Serene && window.Serene[compName]) ||
    (window.Editorial && window.Editorial[compName]) ||
    (window.Organic && window.Organic[compName]) ||
    (window.Brutalist && window.Brutalist[compName]);

  return (
    <div data-screen-label={`${String(dir).padStart(2,"0")} ${cfg.name} · ${view}`} data-om-validate>
      {Comp ? <Comp /> : <div style={{ padding: 40 }}>Loading…</div>}
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
