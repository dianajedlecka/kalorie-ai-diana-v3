import React, { useMemo, useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1200&q=90";

const GREEN = "#0b5a3b";
const DARK = "#073f2d";
const CREAM = "#fff7e8";
const BG = "#dfeee0";

const meals = [
  ["breakfast", "Śniadanie", "sun"],
  ["second", "Drugie śniadanie", "bread"],
  ["lunch", "Obiad", "bowl"],
  ["snack", "Podwieczorek", "cup"],
  ["dinner", "Kolacja", "salad"],
];

const healthTabs = [
  ["hashimoto", "Hashimoto", "leaf"],
  ["pcos", "PCOS", "female"],
  ["insulin", "Insulinooporność", "drop"],
  ["diabetes", "Cukrzyca", "heart"],
];

function Icon({ name, size = 28 }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 64 64",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };

  const icons = {
    sun: (
      <svg {...p}>
        <circle cx="32" cy="32" r="12" fill="#FFD45A" stroke="#D99900" strokeWidth="4" />
        <path d="M32 7v9M32 48v9M7 32h9M48 32h9M14 14l6 6M44 44l6 6M50 14l-6 6M20 44l-6 6" stroke="#D99900" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    bread: (
      <svg {...p}>
        <rect x="16" y="18" width="32" height="34" rx="8" fill="#E5B85D" stroke="#9B6F22" strokeWidth="3" />
        <path d="M23 31h18M23 39h18" stroke="#9B6F22" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    bowl: (
      <svg {...p}>
        <path d="M14 34h36c-2 13-9 20-18 20s-16-7-18-20Z" fill="#E46F33" stroke="#92451E" strokeWidth="3" />
        <path d="M18 33c6-11 22-11 28 0" fill="#79B85C" />
        <circle cx="31" cy="25" r="5" fill="#D83224" />
      </svg>
    ),
    cup: (
      <svg {...p}>
        <path d="M18 21h28v21c0 7-6 12-14 12s-14-5-14-12V21Z" fill="#F7F2E6" stroke={GREEN} strokeWidth="3" />
        <path d="M46 28h5c4 0 6 3 6 7s-2 7-6 7h-5" stroke={GREEN} strokeWidth="3" />
        <path d="M25 13c-3 4 3 5 0 9M35 13c-3 4 3 5 0 9" stroke="#9B6F22" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    salad: (
      <svg {...p}>
        <path d="M14 37h36c-2 11-9 18-18 18s-16-7-18-18Z" fill="#54A247" stroke={GREEN} strokeWidth="3" />
        <path d="M20 35c4-12 20-15 27 0" fill="#76C867" />
        <circle cx="32" cy="28" r="5" fill="#D73628" />
      </svg>
    ),
    leaf: (
      <svg {...p}>
        <path d="M50 12C25 15 13 28 16 49c21 3 34-11 34-37Z" fill="#75C56B" stroke={GREEN} strokeWidth="3" />
        <path d="M18 47c12-11 19-18 29-31" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    female: (
      <svg {...p}>
        <circle cx="32" cy="23" r="13" fill="#FFD7DE" stroke="#C94867" strokeWidth="4" />
        <path d="M32 36v20M22 48h20" stroke="#C94867" strokeWidth="4" strokeLinecap="round" />
      </svg>
    ),
    drop: (
      <svg {...p}>
        <path d="M32 8C22 22 16 31 16 40c0 10 7 16 16 16s16-6 16-16c0-9-6-18-16-32Z" fill="#DDF4FF" stroke="#2693D8" strokeWidth="4" />
      </svg>
    ),
    heart: (
      <svg {...p}>
        <path d="M32 53S11 39 11 24c0-8 6-14 14-14 4 0 7 2 7 5 0-3 3-5 7-5 8 0 14 6 14 14 0 15-21 29-21 29Z" fill="#B66CF2" stroke="#7A36B2" strokeWidth="3" />
        <path d="M18 31h8l4-8 6 16 4-8h7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    protein: (
      <svg {...p}>
        <ellipse cx="32" cy="32" rx="17" ry="22" fill="#FFF8D7" stroke="#D0A43B" strokeWidth="3" />
        <circle cx="33" cy="34" r="8" fill="#FFD45A" stroke="#D0A43B" strokeWidth="2" />
      </svg>
    ),
    wheat: (
      <svg {...p}>
        <path d="M32 55V12" stroke="#A97710" strokeWidth="4" strokeLinecap="round" />
        {[18, 28, 38].map((y) => (
          <React.Fragment key={y}>
            <ellipse cx="25" cy={y} rx="5" ry="9" transform={`rotate(-30 25 ${y})`} fill="#E3B23C" stroke="#A97710" strokeWidth="2" />
            <ellipse cx="39" cy={y} rx="5" ry="9" transform={`rotate(30 39 ${y})`} fill="#E3B23C" stroke="#A97710" strokeWidth="2" />
          </React.Fragment>
        ))}
      </svg>
    ),
    fat: (
      <svg {...p}>
        <path d="M32 8C21 24 16 33 16 42c0 9 7 15 16 15s16-6 16-15c0-9-5-18-16-34Z" fill="#80C95B" stroke={GREEN} strokeWidth="3" />
        <circle cx="33" cy="40" r="6" fill="#E79A35" />
      </svg>
    ),
    camera: (
      <svg {...p}>
        <rect x="13" y="21" width="38" height="28" rx="7" fill="#F7F2E6" stroke={GREEN} strokeWidth="3" />
        <path d="M24 21l4-7h8l4 7" stroke={GREEN} strokeWidth="3" strokeLinecap="round" />
        <circle cx="32" cy="35" r="8" stroke={GREEN} strokeWidth="3" />
      </svg>
    ),
    pen: (
      <svg {...p}>
        <path d="M16 47l4-12 25-25 9 9-25 25-13 3Z" stroke={GREEN} strokeWidth="4" strokeLinejoin="round" />
      </svg>
    ),
  };

  return icons[name] || icons.leaf;
}

function getDays() {
  const names = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];
  const out = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push({
      name: names[d.getDay()],
      date: d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
      kcal: 0,
      today: i === 0,
    });
  }
  return out;
}

export default function App() {
  const [meal, setMeal] = useState("Śniadanie");
  const [goal, setGoal] = useState(2000);
  const [activeHealth, setActiveHealth] = useState("diabetes");
  const days = useMemo(getDays, []);

  return (
    <>
      <main className="app">
        <section className="hero">
          <div>
            <span className="eyebrow">FIT & HEALTH TRACKER</span>
            <h1>Fit and Health</h1>
            <em>by Diana</em>
            <p>Analiza posiłków, makro i ocena dla Hashimoto, PCOS oraz insulinooporności.</p>
          </div>
          <div className="today">
            <b>Dzisiaj</b>
            <strong>0</strong>
            <span>kcal</span>
          </div>
        </section>

        <section className="card add">
          <h2>Dodaj posiłek</h2>

          <div className="addGrid">
            <label>
              <span>Posiłek</span>
              <div className="input select">
                <Icon name="sun" size={26} />
                <select value={meal} onChange={(e) => setMeal(e.target.value)}>
                  {meals.map((m) => (
                    <option key={m[0]}>{m[1]}</option>
                  ))}
                </select>
              </div>
            </label>

            <label>
              <span>Waga porcji</span>
              <div className="input weight">
                <input defaultValue="200" />
                <b>g</b>
              </div>
            </label>

            <button className="photoMini">
              <Icon name="camera" size={38} />
              <strong>Add photo</strong>
              <small>lub z galerii</small>
            </button>
          </div>

          <div className="actionGrid">
            <button className="aiBtn">✨ Rozpoznaj posiłek AI</button>
            <button className="manualBtn">
              <Icon name="pen" size={20} /> Policz ręcznie
            </button>
          </div>
        </section>

        <section className="card health">
          <h2>Ocena zdrowotna posiłku</h2>
          <p>Szybka orientacyjna ocena dla wybranego obszaru zdrowia.</p>

          <div className="healthGrid">
            {healthTabs.map(([key, label, icon]) => (
              <button
                key={key}
                onClick={() => setActiveHealth(key)}
                className={activeHealth === key ? "active" : ""}
              >
                <Icon name={icon} size={46} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card weekTop">
          <h2>7 dni</h2>
          <div className="days">
            {days.map((d) => (
              <div className={d.today ? "day active" : "day"} key={d.name + d.date}>
                <b>{d.name}</b>
                <span>{d.date}</span>
                <strong>0</strong>
                <small>kcal</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card goal">
          <div className="goalTop">
            <div>
              <h2>Cel dzienny</h2>
              <div className="goalInput">
                <input value={goal} onChange={(e) => setGoal(e.target.value)} />
                <b>kcal</b>
              </div>
            </div>

            <div className="remaining">
              <span>Zostało</span>
              <strong>{goal}</strong>
              <b>kcal</b>
            </div>
          </div>

          <div className="macroCards">
            <div className="macroMini">
              <Icon name="protein" size={34} />
              <b>Białko</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <Icon name="wheat" size={34} />
              <b>Węgle</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <Icon name="fat" size={34} />
              <b>Tłuszcze</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <Icon name="leaf" size={34} />
              <b>Błonnik</b>
              <strong>0 g</strong>
              <i />
            </div>
          </div>
        </section>

        <section className="charts">
          <div className="card chartCard">
            <h2>Makro</h2>
            <div className="macroChart">
              <div className="donut">
                <b>0 g</b>
                <span>łącznie</span>
              </div>
              <div className="legend">
                <p><i /> Białko <b>0 g</b></p>
                <p><i /> Węgle <b>0 g</b></p>
                <p><i /> Tłuszcze <b>0 g</b></p>
              </div>
            </div>
          </div>

          <div className="card chartCard">
            <h2>7 dni – kcal</h2>
            <div className="bars">
              {days.map((d) => (
                <div className="bar" key={d.name}>
                  <div />
                  <b>{d.name}</b>
                  <span>0</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card meals">
          <h2>Posiłki</h2>
          {meals.map(([key, label, icon]) => (
            <div className="mealRow" key={key}>
              <div>
                <Icon name={icon} size={30} />
                <b>{label}</b>
              </div>
              <strong>0 kcal</strong>
              <em>›</em>
            </div>
          ))}
        </section>

        <nav className="bottom">
          <button>⌘<span>Dzisiaj</span></button>
          <button>▤<span>Dziennik</span></button>
          <button>▥<span>Statystyki</span></button>
          <button>⚙<span>Ustawienia</span></button>
        </nav>
      </main>

      <style>{`
        * { box-sizing: border-box; }
        body {
          margin: 0;
          background: ${BG};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          color: ${DARK};
        }
        .app {
          max-width: 920px;
          margin: 0 auto;
          padding: 18px 18px 96px;
        }
        .hero {
          min-height: 250px;
          border-radius: 28px;
          padding: 32px;
          color: white;
          background:
            linear-gradient(90deg, rgba(4,55,36,.93), rgba(4,55,36,.45)),
            url(${HERO_IMAGE});
          background-size: cover;
          background-position: center;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          overflow: hidden;
          box-shadow: 0 14px 40px rgba(0,0,0,.16);
        }
        .eyebrow { font-size: 13px; letter-spacing: 4px; font-weight: 900; }
        .hero h1 { font-size: 52px; margin: 22px 0 0; line-height: .95; }
        .hero em { display: block; color: #e6ef79; font-size: 34px; font-family: cursive; margin-bottom: 12px; }
        .hero p { font-size: 21px; line-height: 1.25; font-weight: 800; max-width: 470px; margin: 0; }
        .today {
          width: 150px;
          height: 150px;
          border-radius: 24px;
          background: rgba(0,68,45,.92);
          display: grid;
          place-items: center;
          align-content: center;
          border: 1px solid rgba(255,255,255,.35);
          flex: 0 0 auto;
        }
        .today b { font-size: 20px; }
        .today strong { font-size: 58px; line-height: .95; color: white; }
        .today span { font-size: 20px; font-weight: 800; }

        .card {
          background: linear-gradient(145deg, #fffaf0, #fff4df);
          border: 1px solid rgba(97,76,42,.12);
          border-radius: 24px;
          padding: 24px;
          margin-top: 16px;
          box-shadow: 0 12px 35px rgba(65,50,20,.08);
        }
        h2 { margin: 0 0 16px; font-size: 34px; color: ${GREEN}; line-height: 1; }
        .addGrid {
          display: grid;
          grid-template-columns: 1.2fr .95fr .95fr;
          gap: 18px;
          align-items: end;
        }
        label span {
          display: block;
          font-size: 17px;
          font-weight: 900;
          margin-bottom: 8px;
        }
        .input {
          height: 62px;
          border: 1px solid #e2d4ba;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .select svg { margin: 0 12px; flex: 0 0 auto; }
        select, input {
          border: 0;
          background: transparent;
          outline: 0;
          width: 100%;
          font-size: 22px;
          color: #1d1b18;
        }
        .weight input { padding-left: 22px; }
        .weight b {
          width: 54px;
          height: 100%;
          display: grid;
          place-items: center;
          border-left: 1px solid #e2d4ba;
          font-size: 20px;
          color: ${GREEN};
        }
        button { font-family: inherit; cursor: pointer; }
        .photoMini {
          height: 62px;
          border-radius: 16px;
          border: 1px solid #e2d4ba;
          background: #fff8ec;
          color: ${GREEN};
          display: grid;
          grid-template-columns: 48px 1fr;
          grid-template-rows: 1fr 1fr;
          align-items: center;
          column-gap: 8px;
          padding: 8px 14px;
          text-align: left;
        }
        .photoMini svg { grid-row: 1 / 3; }
        .photoMini strong { font-size: 19px; }
        .photoMini small { font-size: 13px; color: #6d604f; }
        .actionGrid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 14px;
          margin-top: 18px;
        }
        .aiBtn, .manualBtn {
          min-height: 56px;
          border-radius: 14px;
          font-size: 20px;
          font-weight: 900;
        }
        .aiBtn {
          background: linear-gradient(135deg, #00663f, #0a7b50);
          color: white;
          border: 0;
        }
        .manualBtn {
          background: transparent;
          border: 2px solid ${GREEN};
          color: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .health { padding-bottom: 18px; }
        .health p {
          margin: -8px 0 16px;
          color: #665a49;
          font-size: 19px;
        }
        .healthGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .healthGrid button {
          border: 1px solid #eadbc1;
          background: #fff8ec;
          border-radius: 16px;
          min-height: 112px;
          color: ${GREEN};
          font-weight: 900;
          font-size: 18px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 5px;
        }
        .healthGrid button.active {
          background: #e9f6e9;
          border-color: #8dbb8f;
        }

        .weekTop h2 { font-size: 30px; }
        .days {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
        }
        .day {
          min-height: 100px;
          border-radius: 14px;
          border: 1px solid #eadbc1;
          background: #fff7e8;
          display: grid;
          place-items: center;
          align-content: center;
          color: ${GREEN};
          font-weight: 900;
        }
        .day b { font-size: 16px; }
        .day span { font-size: 15px; }
        .day strong { font-size: 30px; line-height: 1; margin-top: 5px; }
        .day small { font-size: 15px; }
        .day.active { border: 2px solid ${GREEN}; }

        .goalTop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 130px;
          gap: 28px;
          align-items: start;
          padding-right: 58px;
        }
        .goalInput {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .goalInput input {
          width: 105px;
          height: 48px;
          border-radius: 13px;
          border: 1px solid #e2d4ba;
          background: white;
          padding-left: 18px;
          font-size: 19px;
        }
        .goalInput b { font-size: 17px; }
        .remaining {
          width: 122px;
          border-radius: 16px;
          background: linear-gradient(135deg, #00663f, #0b5a3b);
          color: white;
          padding: 12px 10px;
          text-align: center;
          justify-self: start;
          transform: translateX(-22px);
        }
        .remaining span { display: block; font-size: 17px; font-weight: 900; }
        .remaining strong { display: block; font-size: 34px; line-height: .95; }
        .remaining b { font-size: 24px; }

        .macroCards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-top: 18px;
        }
        .macroMini {
          min-height: 108px;
          border-radius: 16px;
          background: #fff8ec;
          border: 1px solid #eadbc1;
          padding: 12px;
          display: grid;
          grid-template-columns: 38px 1fr;
          column-gap: 8px;
          align-items: center;
        }
        .macroMini svg { grid-row: 1 / 3; }
        .macroMini b { font-size: 18px; }
        .macroMini strong { font-size: 26px; line-height: 1; }
        .macroMini i {
          grid-column: 1 / 3;
          height: 6px;
          background: #73c56d;
          border-radius: 999px;
          margin-top: 10px;
        }

        .charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .macroChart {
          display: grid;
          grid-template-columns: 145px 1fr;
          gap: 16px;
          align-items: center;
        }
        .donut {
          width: 130px;
          height: 130px;
          border-radius: 50%;
          background: conic-gradient(#7edb87 0 28%, #4ea1ff 28% 60%, #ffd15a 60% 100%);
          display: grid;
          place-items: center;
          position: relative;
        }
        .donut::after {
          content: "";
          position: absolute;
          width: 78px;
          height: 78px;
          background: #fff8ec;
          border-radius: 50%;
        }
        .donut b, .donut span { position: relative; z-index: 2; }
        .donut b { font-size: 19px; margin-top: 16px; }
        .donut span { font-size: 13px; margin-top: -22px; }
        .legend p {
          display: grid;
          grid-template-columns: 16px 1fr 45px;
          align-items: center;
          gap: 10px;
          font-size: 18px;
          font-weight: 900;
        }
        .legend i {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #0aa56b;
        }
        .legend p:nth-child(2) i { background: #f08320; }
        .legend p:nth-child(3) i { background: #ffd15a; }

        .bars {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          align-items: end;
        }
        .bar { text-align: center; font-weight: 900; color: ${GREEN}; }
        .bar div {
          height: 98px;
          background: #f1e3ca;
          border-radius: 999px;
          margin-bottom: 8px;
        }
        .bar b, .bar span { display: block; font-size: 14px; }

        .meals h2 { margin-bottom: 8px; }
        .mealRow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 72px 18px;
          gap: 10px;
          align-items: center;
          padding: 10px 54px 10px 4px;
          border-bottom: 1px solid rgba(110,80,40,.14);
        }
        .mealRow:last-child { border-bottom: 0; }
        .mealRow > div {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .mealRow b {
          font-size: 24px;
          color: ${GREEN};
          white-space: nowrap;
        }
        .mealRow strong {
          font-size: 19px;
          color: #1f1b15;
          white-space: nowrap;
          text-align: right;
        }
        .mealRow em {
          font-style: normal;
          font-size: 30px;
          color: #6e6659;
        }

        .bottom {
          position: sticky;
          bottom: 12px;
          z-index: 20;
          margin-top: 18px;
          min-height: 72px;
          border-radius: 22px;
          background: rgba(255,248,236,.96);
          border: 1px solid rgba(120,80,30,.12);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          box-shadow: 0 12px 35px rgba(0,0,0,.12);
        }
        .bottom button {
          border: 0;
          background: transparent;
          color: ${GREEN};
          font-size: 25px;
          font-weight: 900;
        }
        .bottom span {
          display: block;
          font-size: 13px;
          margin-top: 3px;
        }

        @media (max-width: 760px) {
          .app { padding: 10px 10px 82px; max-width: 100%; }
          .hero {
            min-height: 155px;
            padding: 18px;
            border-radius: 18px;
          }
          .eyebrow { font-size: 8px; letter-spacing: 2px; }
          .hero h1 { font-size: 31px; margin-top: 10px; }
          .hero em { font-size: 23px; margin-bottom: 6px; }
          .hero p { font-size: 12px; max-width: 225px; }
          .today {
            width: 78px;
            height: 92px;
            border-radius: 14px;
          }
          .today b { font-size: 11px; }
          .today strong { font-size: 34px; }
          .today span { font-size: 12px; }

          .card {
            border-radius: 18px;
            padding: 13px;
            margin-top: 10px;
          }
          h2 { font-size: 22px; margin-bottom: 11px; }

          .addGrid {
            grid-template-columns: 1.35fr 1fr;
            gap: 9px;
          }
          .photoMini {
            grid-column: 1 / 3;
            height: 58px;
            display: flex;
            justify-content: center;
            gap: 10px;
            text-align: left;
          }
          .photoMini strong { font-size: 16px; }
          .photoMini small { font-size: 11px; }
          label span { font-size: 12px; margin-bottom: 5px; }
          .input { height: 42px; border-radius: 12px; }
          select, input { font-size: 14px; }
          .select svg { width: 22px; height: 22px; margin: 0 6px; }
          .weight input { padding-left: 10px; }
          .weight b { width: 36px; font-size: 13px; }
          .actionGrid { gap: 8px; margin-top: 10px; }
          .aiBtn, .manualBtn {
            min-height: 42px;
            font-size: 13px;
            border-radius: 12px;
          }

          .health h2 { font-size: 20px; margin-bottom: 4px; }
          .health p {
            font-size: 12px;
            margin: 0 0 10px;
            line-height: 1.25;
          }
          .healthGrid {
            grid-template-columns: repeat(4, 1fr);
            gap: 7px;
          }
          .healthGrid button {
            min-height: 76px;
            border-radius: 12px;
            font-size: 10.5px;
            gap: 2px;
            padding: 5px 2px;
          }
          .healthGrid button svg {
            width: 35px;
            height: 35px;
          }

          .weekTop h2 { font-size: 20px; }
          .days {
            grid-template-columns: repeat(7, minmax(42px, 1fr));
            gap: 5px;
          }
          .day {
            min-height: 66px;
            border-radius: 10px;
            padding: 4px 2px;
          }
          .day b { font-size: 10px; }
          .day span { font-size: 10px; }
          .day strong { font-size: 19px; margin-top: 2px; }
          .day small { font-size: 10px; }

          .goalTop {
            grid-template-columns: minmax(0, 1fr) 94px;
            gap: 8px;
            padding-right: 42px;
          }
          .goal h2 { font-size: 22px; }
          .goalInput input {
            width: 72px;
            height: 36px;
            border-radius: 10px;
            font-size: 13px;
            padding-left: 10px;
          }
          .goalInput b { font-size: 11px; }
          .remaining {
            width: 88px;
            padding: 8px 6px;
            border-radius: 12px;
            transform: translateX(-32px);
          }
          .remaining span { font-size: 11px; }
          .remaining strong { font-size: 24px; }
          .remaining b { font-size: 18px; }

          .macroCards {
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            margin-top: 10px;
          }
          .macroMini {
            min-height: 82px;
            border-radius: 12px;
            padding: 8px 6px;
            grid-template-columns: 24px 1fr;
            column-gap: 4px;
          }
          .macroMini svg { width: 24px; height: 24px; }
          .macroMini b {
            font-size: 12px;
            line-height: 1.05;
            white-space: nowrap;
          }
          .macroMini strong { font-size: 18px; }
          .macroMini i { height: 4px; margin-top: 5px; }

          .charts {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .chartCard h2 { font-size: 20px; }
          .macroChart {
            grid-template-columns: 88px 1fr;
            gap: 7px;
          }
          .donut {
            width: 82px;
            height: 82px;
          }
          .donut::after {
            width: 50px;
            height: 50px;
          }
          .donut b { font-size: 12px; margin-top: 10px; }
          .donut span { font-size: 9px; margin-top: -16px; }
          .legend p {
            font-size: 10.5px;
            grid-template-columns: 9px 1fr 26px;
            gap: 4px;
            margin: 5px 0;
          }
          .legend i { width: 9px; height: 9px; }

          .bars { gap: 4px; }
          .bar div { height: 66px; margin-bottom: 5px; }
          .bar b, .bar span { font-size: 10px; }

          .meals h2 { font-size: 22px; }
          .mealRow {
            grid-template-columns: minmax(0, 1fr) 58px 12px;
            gap: 4px;
            padding: 8px 44px 8px 2px;
          }
          .mealRow > div { gap: 8px; }
          .mealRow svg { width: 24px; height: 24px; }
          .mealRow b {
            font-size: 16px;
            white-space: nowrap;
          }
          .mealRow strong {
            font-size: 15px;
            text-align: right;
          }
          .mealRow em {
            font-size: 22px;
          }

          .bottom {
            min-height: 62px;
            border-radius: 18px;
            bottom: 8px;
          }
          .bottom button { font-size: 20px; }
          .bottom span { font-size: 10px; }
        }
      `}</style>
    </>
  );
}
