import React, { useMemo, useState } from "react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1400&q=90";

const GREEN = "#0b5a3b";
const DARK = "#073f2d";
const BG = "#dfeee0";

const meals = [
  ["Śniadanie", "☀️"],
  ["Drugie śniadanie", "🍞"],
  ["Obiad", "🥗"],
  ["Podwieczorek", "☕"],
  ["Kolacja", "🥬"],
];

const healthTabs = [
  ["Hashimoto", "🍃"],
  ["PCOS", "♀"],
  ["Insulinooporność", "💧"],
  ["Cukrzyca", "💜"],
];

function getDays() {
  const names = ["niedz.", "pon.", "wt.", "śr.", "czw.", "pt.", "sob."];
  const today = new Date();

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - index));

    return {
      day: names[d.getDay()],
      date: d.toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      }),
      active: index === 6,
    };
  });
}

export default function App() {
  const [goal, setGoal] = useState(2000);
  const [selectedMeal, setSelectedMeal] = useState("Śniadanie");
  const [activeHealth, setActiveHealth] = useState("Cukrzyca");
  const days = useMemo(getDays, []);

  return (
    <>
      <main className="app">
        <section className="hero">
          <div>
            <div className="eyebrow">FIT & HEALTH TRACKER</div>
            <h1>Fit and Health</h1>
            <div className="signature">by Diana</div>
            <p>
              Analiza posiłków, makro i ocena dla Hashimoto, PCOS oraz
              insulinooporności.
            </p>
          </div>

          <div className="todayBox">
            <span>Dzisiaj</span>
            <span className="big">0</span>
            <span>kcal</span>
          </div>
        </section>

        <section className="card">
          <h2>Dodaj posiłek</h2>

          <div className="addGrid">
            <label>
              <span>Posiłek</span>
              <div className="field">
                <span className="icon">☀️</span>
                <select
                  value={selectedMeal}
                  onChange={(e) => setSelectedMeal(e.target.value)}
                >
                  {meals.map(([name]) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </div>
            </label>

            <label>
              <span>Waga porcji</span>
              <div className="field weight">
                <input defaultValue="200" />
                <span>g</span>
              </div>
            </label>

            <button className="photoBtn">
              <span className="icon">📷</span>
              <span>Add photo</span>
            </button>
          </div>

          <div className="actions">
            <button className="aiBtn">✨ Rozpoznaj posiłek AI</button>
            <button className="manualBtn">✎ Policz ręcznie</button>
          </div>
        </section>

        <section className="card">
          <h2>Ocena zdrowotna posiłku</h2>

          <div className="healthGrid">
            {healthTabs.map(([name, icon]) => (
              <button
                key={name}
                className={activeHealth === name ? "active" : ""}
                onClick={() => setActiveHealth(name)}
              >
                <span className="healthIcon">{icon}</span>
                <span>{name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="card">
          <h2>7 dni</h2>

          <div className="daysGrid">
            {days.map((d) => (
              <div className={d.active ? "day active" : "day"} key={d.day + d.date}>
                <span>{d.day}</span>
                <span>{d.date}</span>
                <span>0</span>
                <span>kcal</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card">
          <div className="goalTop">
            <div>
              <h2>Cel dzienny</h2>
              <div className="goalInput">
                <input value={goal} onChange={(e) => setGoal(e.target.value)} />
                <span>kcal</span>
              </div>
            </div>

            <div className="remainingBox">
              <span>Zostało</span>
              <span>{goal}</span>
              <span>kcal</span>
            </div>
          </div>

          <div className="macroCards">
            <div className="macroMini">
              <span className="icon">🥚</span>
              <span>Białko</span>
              <span>0 g</span>
              <i />
            </div>

            <div className="macroMini">
              <span className="icon">🌾</span>
              <span>Węgle</span>
              <span>0 g</span>
              <i />
            </div>

            <div className="macroMini">
              <span className="icon">🥑</span>
              <span>Tłuszcze</span>
              <span>0 g</span>
              <i />
            </div>

            <div className="macroMini">
              <span className="icon">🍃</span>
              <span>Błonnik</span>
              <span>0 g</span>
              <i />
            </div>
          </div>
        </section>

        <section className="chartsGrid">
          <div className="card chartCard">
            <h2>Makro</h2>

            <div className="macroChart">
              <div className="donut">
                <span>0 g</span>
              </div>

              <div className="legend">
                <p><i /> <span>Białko</span> <span>0 g</span></p>
                <p><i /> <span>Węgle</span> <span>0 g</span></p>
                <p><i /> <span>Tłuszcze</span> <span>0 g</span></p>
              </div>
            </div>
          </div>

          <div className="card chartCard">
            <h2>7 dni – kcal</h2>

            <div className="bars">
              {days.map((d) => (
                <div className="bar" key={d.day}>
                  <div />
                  <span>{d.day}</span>
                  <span>0</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card mealsCard">
          <h2>Posiłki</h2>

          {meals.map(([name, icon]) => (
            <div className="mealRow" key={name}>
              <div>
                <span className="icon">{icon}</span>
                <span>{name}</span>
              </div>
              <span>0 kcal</span>
              <span>›</span>
            </div>
          ))}
        </section>

        <nav className="bottomNav">
          <button>⌘<span>Dzisiaj</span></button>
          <button>▤<span>Dziennik</span></button>
          <button>▥<span>Statystyki</span></button>
          <button>⚙<span>Ustawienia</span></button>
        </nav>
      </main>

      <style>{`
        * {
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
          font-weight: 400 !important;
        }

        body {
          margin: 0;
          background: ${BG};
          color: ${DARK};
        }

        .app {
          max-width: 920px;
          margin: 0 auto;
          padding: 18px 18px 96px;
        }

        .hero {
          min-height: 220px;
          border-radius: 26px;
          padding: 28px;
          color: white;
          background:
            linear-gradient(90deg, rgba(4, 55, 36, 0.94), rgba(4, 55, 36, 0.45)),
            url(${HERO_IMAGE});
          background-size: cover;
          background-position: center;
          display: flex;
          justify-content: space-between;
          gap: 16px;
          overflow: hidden;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
        }

        .hero h1 {
          font-size: 36px;
          margin: 16px 0 0;
          line-height: 1;
        }

        .signature {
          color: #e6ef79;
          font-size: 24px;
          font-family: cursive !important;
          margin-bottom: 10px;
        }

        .hero p {
          font-size: 15px;
          line-height: 1.25;
          max-width: 450px;
          margin: 0;
        }

        .todayBox {
          width: 120px;
          height: 120px;
          border-radius: 22px;
          background: rgba(0, 68, 45, 0.92);
          display: grid;
          place-items: center;
          align-content: center;
          border: 1px solid rgba(255, 255, 255, 0.35);
          flex: 0 0 auto;
          font-size: 14px;
        }

        .todayBox .big {
          font-size: 24px;
        }

        .card {
          background: linear-gradient(145deg, #fffaf0, #fff4df);
          border: 1px solid rgba(97, 76, 42, 0.12);
          border-radius: 22px;
          padding: 22px;
          margin-top: 14px;
          box-shadow: 0 10px 30px rgba(65, 50, 20, 0.07);
        }

        h2 {
          margin: 0 0 14px;
          font-size: 22px;
          color: ${GREEN};
          line-height: 1.1;
        }

        .addGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.95fr 0.95fr;
          gap: 14px;
          align-items: end;
        }

        label > span {
          display: block;
          font-size: 14px;
          margin-bottom: 6px;
        }

        .field {
          height: 54px;
          border: 1px solid #e2d4ba;
          background: white;
          border-radius: 14px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .field .icon {
          font-size: 20px;
          padding: 0 10px;
        }

        select,
        input {
          border: 0;
          background: transparent;
          outline: 0;
          width: 100%;
          font-size: 14px;
          color: #1d1b18;
        }

        .weight input {
          padding-left: 14px;
        }

        .weight span:last-child {
          width: 44px;
          height: 100%;
          display: grid;
          place-items: center;
          border-left: 1px solid #e2d4ba;
          color: ${GREEN};
          font-size: 14px;
        }

        button {
          cursor: pointer;
        }

        .photoBtn {
          height: 54px;
          border-radius: 14px;
          border: 1px solid #e2d4ba;
          background: #fff8ec;
          color: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
        }

        .photoBtn .icon {
          font-size: 20px;
        }

        .actions {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 12px;
          margin-top: 14px;
        }

        .aiBtn,
        .manualBtn {
          min-height: 48px;
          border-radius: 13px;
          font-size: 14px;
        }

        .aiBtn {
          background: linear-gradient(135deg, #00663f, #0a7b50);
          color: white;
          border: 0;
        }

        .manualBtn {
          background: transparent;
          border: 1px solid ${GREEN};
          color: ${GREEN};
        }

        .healthGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .healthGrid button {
          border: 1px solid #eadbc1;
          background: #fff8ec;
          border-radius: 14px;
          min-height: 84px;
          color: ${GREEN};
          font-size: 14px;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 4px;
        }

        .healthGrid button.active {
          background: #e9f6e9;
          border-color: #8dbb8f;
        }

        .healthIcon {
          font-size: 24px;
        }

        .daysGrid {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 6px;
        }

        .day {
          min-height: 68px;
          border-radius: 12px;
          border: 1px solid #eadbc1;
          background: #fff7e8;
          display: grid;
          place-items: center;
          align-content: center;
          color: ${GREEN};
          font-size: 13px;
          line-height: 1.1;
        }

        .day.active {
          border: 1px solid ${GREEN};
        }

        .goalTop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 94px;
          gap: 12px;
          align-items: start;
          padding-right: 38px;
        }

        .goalInput {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .goalInput input {
          width: 82px;
          height: 38px;
          border-radius: 10px;
          border: 1px solid #e2d4ba;
          background: white;
          padding-left: 12px;
          font-size: 14px;
        }

        .remainingBox {
          width: 88px;
          border-radius: 14px;
          background: linear-gradient(135deg, #00663f, #0b5a3b);
          color: white;
          padding: 8px 5px;
          text-align: center;
          justify-self: start;
          transform: translateX(-26px);
          display: grid;
          gap: 1px;
          font-size: 13px;
          line-height: 1.05;
        }

        .macroCards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
          margin-top: 14px;
        }

        .macroMini {
          min-height: 76px;
          border-radius: 14px;
          background: #fff8ec;
          border: 1px solid #eadbc1;
          padding: 8px 6px;
          display: grid;
          grid-template-columns: 24px 1fr;
          column-gap: 5px;
          align-items: center;
          font-size: 14px;
          line-height: 1.1;
        }

        .macroMini .icon {
          grid-row: 1 / 3;
          font-size: 20px;
        }

        .macroMini i {
          grid-column: 1 / 3;
          height: 4px;
          background: #73c56d;
          border-radius: 999px;
          margin-top: 6px;
        }

        .chartsGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .macroChart {
          display: grid;
          grid-template-columns: 86px 1fr;
          gap: 8px;
          align-items: center;
        }

        .donut {
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: conic-gradient(#7edb87 0 28%, #4ea1ff 28% 60%, #ffd15a 60% 100%);
          display: grid;
          place-items: center;
          position: relative;
          font-size: 12px;
        }

        .donut::after {
          content: "";
          position: absolute;
          width: 48px;
          height: 48px;
          background: #fff8ec;
          border-radius: 50%;
        }

        .donut span {
          position: relative;
          z-index: 2;
        }

        .legend p {
          display: grid;
          grid-template-columns: 8px 1fr 28px;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          margin: 4px 0;
          line-height: 1.1;
        }

        .legend i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #0aa56b;
        }

        .legend p:nth-child(2) i {
          background: #f08320;
        }

        .legend p:nth-child(3) i {
          background: #ffd15a;
        }

        .bars {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 3px;
          align-items: end;
        }

        .bar {
          text-align: center;
          color: ${GREEN};
          font-size: 12px;
          line-height: 1.1;
        }

        .bar div {
          height: 56px;
          background: #f1e3ca;
          border-radius: 999px;
          margin-bottom: 4px;
        }

        .mealRow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 58px 12px;
          gap: 4px;
          align-items: center;
          padding: 9px 40px 9px 2px;
          border-bottom: 1px solid rgba(110, 80, 40, 0.14);
          font-size: 14px;
        }

        .mealRow:last-child {
          border-bottom: 0;
        }

        .mealRow > div {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }

        .mealRow .icon {
          font-size: 18px;
        }

        .mealRow span {
          white-space: nowrap;
        }

        .mealRow > span:nth-child(2) {
          text-align: right;
          color: #1f1b15;
        }

        .bottomNav {
          position: sticky;
          bottom: 8px;
          z-index: 20;
          margin-top: 14px;
          min-height: 58px;
          border-radius: 18px;
          background: rgba(255, 248, 236, 0.96);
          border: 1px solid rgba(120, 80, 30, 0.12);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.1);
        }

        .bottomNav button {
          border: 0;
          background: transparent;
          color: ${GREEN};
          font-size: 16px;
        }

        .bottomNav span {
          display: block;
          font-size: 10px;
          margin-top: 2px;
        }

        @media (max-width: 760px) {
          .app {
            padding: 10px 10px 82px;
            max-width: 100%;
          }

          .hero {
            min-height: 138px;
            padding: 14px;
            border-radius: 18px;
          }

          .eyebrow {
            font-size: 8px;
            letter-spacing: 2px;
          }

          .hero h1 {
            font-size: 23px;
            margin-top: 8px;
          }

          .signature {
            font-size: 17px;
            margin-bottom: 5px;
          }

          .hero p {
            font-size: 12px;
            max-width: 220px;
          }

          .todayBox {
            width: 68px;
            height: 78px;
            border-radius: 13px;
            font-size: 12px;
          }

          .todayBox .big {
            font-size: 17px;
          }

          .card {
            border-radius: 18px;
            padding: 13px;
            margin-top: 10px;
          }

          h2 {
            font-size: 18px !important;
            margin-bottom: 10px !important;
          }

          .addGrid {
            grid-template-columns: 1.35fr 1fr;
            gap: 8px;
          }

          .photoBtn {
            grid-column: 1 / 3;
            height: 42px;
          }

          .field {
            height: 38px;
          }

          .actions {
            gap: 8px;
            margin-top: 9px;
          }

          .aiBtn,
          .manualBtn {
            min-height: 38px;
          }

          .healthGrid {
            gap: 6px;
          }

          .healthGrid button {
            min-height: 58px;
            border-radius: 12px;
            font-size: 12px;
            padding: 4px 2px;
          }

          .healthIcon {
            font-size: 20px;
          }

          .daysGrid {
            gap: 4px;
          }

          .day {
            min-height: 54px;
            font-size: 11px;
            border-radius: 9px;
            padding: 3px 1px;
          }

          .goalTop {
            grid-template-columns: minmax(0, 1fr) 80px;
            padding-right: 34px;
          }

          .remainingBox {
            width: 76px;
            transform: translateX(-30px);
            font-size: 11px;
          }

          .macroCards {
            gap: 5px;
          }

          .macroMini {
            min-height: 62px;
            font-size: 12px;
            grid-template-columns: 18px 1fr;
            padding: 5px 4px;
          }

          .macroMini .icon {
            font-size: 16px;
          }

          .chartsGrid {
            gap: 8px;
          }

          .chartCard {
            padding: 11px;
          }

          .macroChart {
            grid-template-columns: 62px 1fr;
            gap: 5px;
          }

          .donut {
            width: 58px;
            height: 58px;
            font-size: 10px;
          }

          .donut::after {
            width: 36px;
            height: 36px;
          }

          .legend p {
            font-size: 11px;
            grid-template-columns: 7px 1fr 20px;
          }

          .bar {
            font-size: 10px;
          }

          .bar div {
            height: 46px;
          }

          .mealRow {
            font-size: 14px;
          }
        }
      `}</style>
    </>
  );
}
