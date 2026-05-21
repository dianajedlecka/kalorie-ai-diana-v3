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
      date: d.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit" }),
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
          <div className="heroText">
            <div className="eyebrow">FIT & HEALTH TRACKER</div>
            <h1>Fit and Health</h1>
            <div className="signature">by Diana</div>
            <p>Analiza posiłków, makro i ocena dla Hashimoto, PCOS oraz insulinooporności.</p>
          </div>

          <div className="todayBox">
            <span>Dzisiaj</span>
            <strong>0</strong>
            <b>kcal</b>
          </div>
        </section>

        <section className="card addCard">
          <h2>Dodaj posiłek</h2>

          <div className="addGrid">
            <label>
              <span>Posiłek</span>
              <div className="field">
                <b>☀️</b>
                <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
                  {meals.map(([name]) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </div>
            </label>

            <label>
              <span>Waga porcji</span>
              <div className="weightField">
                <input defaultValue="200" />
                <b>g</b>
              </div>
            </label>

            <button className="photoBtn">
              <span>📷</span>
              <div>
                <strong>Add photo</strong>
                <small>lub z galerii</small>
              </div>
            </button>
          </div>

          <div className="actions">
            <button className="aiBtn">✨ Rozpoznaj posiłek AI</button>
            <button className="manualBtn">✎ Policz ręcznie</button>
          </div>
        </section>

        <section className="card healthCard">
          <h2>Ocena zdrowotna posiłku</h2>
          <p>Szybka orientacyjna ocena dla wybranego obszaru zdrowia.</p>

          <div className="healthGrid">
            {healthTabs.map(([name, icon]) => (
              <button
                key={name}
                className={activeHealth === name ? "active" : ""}
                onClick={() => setActiveHealth(name)}
              >
                <span>{icon}</span>
                <b>{name}</b>
              </button>
            ))}
          </div>
        </section>

        <section className="card weekCard">
          <h2>7 dni</h2>
          <div className="daysGrid">
            {days.map((d) => (
              <div className={d.active ? "day active" : "day"} key={d.day + d.date}>
                <b>{d.day}</b>
                <span>{d.date}</span>
                <strong>0</strong>
                <small>kcal</small>
              </div>
            ))}
          </div>
        </section>

        <section className="card goalCard">
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
              <strong>{goal}</strong>
              <b>kcal</b>
            </div>
          </div>

          <div className="macroCards">
            <div className="macroMini">
              <span>🥚</span>
              <b>Białko</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <span>🌾</span>
              <b>Węgle</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <span>🥑</span>
              <b>Tłuszcze</b>
              <strong>0 g</strong>
              <i />
            </div>
            <div className="macroMini">
              <span>🍃</span>
              <b>Błonnik</b>
              <strong>0 g</strong>
              <i />
            </div>
          </div>
        </section>

        <section className="chartsGrid">
          <div className="card chartCard">
            <h2>Makro</h2>
            <div className="macroChart">
              <div className="donut">
                <b>0 g</b>
                <span>łącznie</span>
              </div>
              <div className="legend">
                <p><i />Białko <b>0 g</b></p>
                <p><i />Węgle <b>0 g</b></p>
                <p><i />Tłuszcze <b>0 g</b></p>
              </div>
            </div>
          </div>

          <div className="card chartCard">
            <h2>7 dni – kcal</h2>
            <div className="bars">
              {days.map((d) => (
                <div className="bar" key={d.day}>
                  <div />
                  <b>{d.day}</b>
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
                <span>{icon}</span>
                <b>{name}</b>
              </div>
              <strong>0 kcal</strong>
              <em>›</em>
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
        }

        body {
          margin: 0;
          background: ${BG};
          color: ${DARK};
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
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
            linear-gradient(90deg, rgba(4, 55, 36, 0.95), rgba(4, 55, 36, 0.45)),
            url(${HERO_IMAGE});
          background-size: cover;
          background-position: center;
          display: flex;
          justify-content: space-between;
          gap: 18px;
          box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
          overflow: hidden;
        }

        .eyebrow {
          font-size: 13px;
          letter-spacing: 4px;
          font-weight: 900;
        }

        .hero h1 {
          font-size: 52px;
          margin: 22px 0 0;
          line-height: 0.95;
        }

        .signature {
          color: #e6ef79;
          font-size: 34px;
          font-family: cursive;
          margin-bottom: 12px;
        }

        .hero p {
          font-size: 21px;
          line-height: 1.25;
          font-weight: 800;
          max-width: 470px;
          margin: 0;
        }

        .todayBox {
          width: 150px;
          height: 150px;
          border-radius: 24px;
          background: rgba(0, 68, 45, 0.92);
          display: grid;
          place-items: center;
          align-content: center;
          border: 1px solid rgba(255, 255, 255, 0.35);
          flex: 0 0 auto;
        }

        .todayBox span {
          font-size: 20px;
          font-weight: 900;
        }

        .todayBox strong {
          font-size: 58px;
          line-height: 0.95;
          color: white;
        }

        .todayBox b {
          font-size: 20px;
        }

        .card {
          background: linear-gradient(145deg, #fffaf0, #fff4df);
          border: 1px solid rgba(97, 76, 42, 0.12);
          border-radius: 24px;
          padding: 24px;
          margin-top: 16px;
          box-shadow: 0 12px 35px rgba(65, 50, 20, 0.08);
        }

        h2 {
          margin: 0 0 16px;
          font-size: 34px;
          color: ${GREEN};
          line-height: 1.05;
        }

        .addGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.95fr 0.95fr;
          gap: 18px;
          align-items: end;
        }

        label span {
          display: block;
          font-size: 17px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .field,
        .weightField {
          height: 62px;
          border: 1px solid #e2d4ba;
          background: white;
          border-radius: 16px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .field b {
          font-size: 26px;
          margin: 0 12px;
        }

        select,
        input {
          border: 0;
          background: transparent;
          outline: 0;
          width: 100%;
          font-size: 22px;
          color: #1d1b18;
        }

        .weightField input {
          padding-left: 22px;
        }

        .weightField b {
          width: 54px;
          height: 100%;
          display: grid;
          place-items: center;
          border-left: 1px solid #e2d4ba;
          font-size: 20px;
          color: ${GREEN};
        }

        button {
          font-family: inherit;
          cursor: pointer;
        }

        .photoBtn {
          height: 62px;
          border-radius: 16px;
          border: 1px solid #e2d4ba;
          background: #fff8ec;
          color: ${GREEN};
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 8px 14px;
        }

        .photoBtn span {
          font-size: 34px;
        }

        .photoBtn strong {
          display: block;
          font-size: 19px;
        }

        .photoBtn small {
          display: block;
          font-size: 13px;
          color: #6d604f;
        }

        .actions {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 14px;
          margin-top: 18px;
        }

        .aiBtn,
        .manualBtn {
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
        }

        .healthCard p {
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

        .healthGrid button span {
          font-size: 38px;
        }

        .healthGrid button.active {
          background: #e9f6e9;
          border-color: #8dbb8f;
        }

        .daysGrid {
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

        .day b {
          font-size: 16px;
        }

        .day span {
          font-size: 15px;
        }

        .day strong {
          font-size: 30px;
          line-height: 1;
          margin-top: 5px;
        }

        .day small {
          font-size: 15px;
        }

        .day.active {
          border: 2px solid ${GREEN};
        }

        .goalTop {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 120px;
          gap: 18px;
          align-items: start;
          padding-right: 52px;
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

        .goalInput span {
          font-size: 17px;
          font-weight: 900;
        }

        .remainingBox {
          width: 110px;
          border-radius: 16px;
          background: linear-gradient(135deg, #00663f, #0b5a3b);
          color: white;
          padding: 12px 8px;
          text-align: center;
          justify-self: start;
          transform: translateX(-22px);
        }

        .remainingBox span {
          display: block;
          font-size: 15px;
          font-weight: 900;
        }

        .remainingBox strong {
          display: block;
          font-size: 31px;
          line-height: 0.95;
        }

        .remainingBox b {
          font-size: 22px;
        }

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

        .macroMini span {
          grid-row: 1 / 3;
          font-size: 28px;
        }

        .macroMini b {
          font-size: 18px;
        }

        .macroMini strong {
          font-size: 26px;
          line-height: 1;
        }

        .macroMini i {
          grid-column: 1 / 3;
          height: 6px;
          background: #73c56d;
          border-radius: 999px;
          margin-top: 10px;
        }

        .chartsGrid {
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

        .donut b,
        .donut span {
          position: relative;
          z-index: 2;
        }

        .donut b {
          font-size: 19px;
          margin-top: 16px;
        }

        .donut span {
          font-size: 13px;
          margin-top: -22px;
        }

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

        .legend p:nth-child(2) i {
          background: #f08320;
        }

        .legend p:nth-child(3) i {
          background: #ffd15a;
        }

        .bars {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 8px;
          align-items: end;
        }

        .bar {
          text-align: center;
          font-weight: 900;
          color: ${GREEN};
        }

        .bar div {
          height: 98px;
          background: #f1e3ca;
          border-radius: 999px;
          margin-bottom: 8px;
        }

        .bar b,
        .bar span {
          display: block;
          font-size: 14px;
        }

        .mealRow {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 72px 18px;
          gap: 10px;
          align-items: center;
          padding: 10px 54px 10px 4px;
          border-bottom: 1px solid rgba(110, 80, 40, 0.14);
        }

        .mealRow:last-child {
          border-bottom: 0;
        }

        .mealRow > div {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .mealRow span {
          font-size: 26px;
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

        .bottomNav {
          position: sticky;
          bottom: 12px;
          z-index: 20;
          margin-top: 18px;
          min-height: 72px;
          border-radius: 22px;
          background: rgba(255, 248, 236, 0.96);
          border: 1px solid rgba(120, 80, 30, 0.12);
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.12);
        }

        .bottomNav button {
          border: 0;
          background: transparent;
          color: ${GREEN};
          font-size: 25px;
          font-weight: 900;
        }

        .bottomNav span {
          display: block;
          font-size: 13px;
          margin-top: 3px;
        }

        @media (max-width: 760px) {
          .app {
            padding: 10px 10px 82px;
            max-width: 100%;
          }

          .hero {
            min-height: 150px;
            padding: 16px;
            border-radius: 18px;
          }

          .eyebrow {
            font-size: 8px;
            letter-spacing: 2px;
          }

          .hero h1 {
            font-size: 29px;
            margin-top: 10px;
          }

          .signature {
            font-size: 22px;
            margin-bottom: 6px;
          }

          .hero p {
            font-size: 12px;
            max-width: 230px;
            line-height: 1.25;
          }

          .todayBox {
            width: 76px;
            height: 88px;
            border-radius: 14px;
          }

          .todayBox span {
            font-size: 11px;
          }

          .todayBox strong {
            font-size: 32px;
          }

          .todayBox b {
            font-size: 12px;
          }

          .card {
            border-radius: 18px;
            padding: 13px;
            margin-top: 10px;
          }

          h2 {
            font-size: 22px;
            margin-bottom: 10px;
            line-height: 1.05;
          }

          .addGrid {
            grid-template-columns: 1.35fr 1fr;
            gap: 9px;
          }

          .photoBtn {
            grid-column: 1 / 3;
            height: 56px;
            border-radius: 12px;
          }

          .photoBtn span {
            font-size: 25px;
          }

          .photoBtn strong {
            font-size: 15px;
          }

          .photoBtn small {
            font-size: 10px;
          }

          label span {
            font-size: 12px;
            margin-bottom: 5px;
          }

          .field,
          .weightField {
            height: 42px;
            border-radius: 12px;
          }

          .field b {
            font-size: 20px;
            margin: 0 6px;
          }

          select,
          input {
            font-size: 14px;
          }

          .weightField input {
            padding-left: 10px;
          }

          .weightField b {
            width: 34px;
            font-size: 13px;
          }

          .actions {
            gap: 8px;
            margin-top: 10px;
          }

          .aiBtn,
          .manualBtn {
            min-height: 42px;
            font-size: 13px;
            border-radius: 12px;
          }

          .healthCard {
            padding: 12px;
          }

          .healthCard h2 {
            font-size: 19px;
            margin-bottom: 4px;
            line-height: 1.05;
          }

          .healthCard p {
            font-size: 11px;
            line-height: 1.2;
            margin: 0 0 9px;
          }

          .healthGrid {
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }

          .healthGrid button {
            min-height: 64px;
            border-radius: 12px;
            font-size: 9.5px;
            padding: 4px 2px;
            gap: 1px;
          }

          .healthGrid button span {
            font-size: 31px;
          }

          .weekCard h2 {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .daysGrid {
            grid-template-columns: repeat(7, minmax(0, 1fr));
            gap: 4px;
          }

          .day {
            min-height: 62px;
            border-radius: 9px;
            padding: 3px 1px;
          }

          .day b,
          .day span,
          .day small {
            font-size: 9px;
            line-height: 1;
          }

          .day strong {
            font-size: 16px;
            line-height: 1;
            margin-top: 2px;
          }

          .goalTop {
            grid-template-columns: minmax(0, 1fr) 88px;
            gap: 6px;
            padding-right: 40px;
          }

          .goalCard h2 {
            font-size: 22px;
          }

          .goalInput input {
            width: 72px;
            height: 36px;
            border-radius: 10px;
            font-size: 13px;
            padding-left: 10px;
          }

          .goalInput span {
            font-size: 11px;
          }

          .remainingBox {
            width: 84px;
            padding: 7px 5px;
            border-radius: 12px;
            transform: translateX(-34px);
          }

          .remainingBox span {
            font-size: 10px;
          }

          .remainingBox strong {
            font-size: 22px;
          }

          .remainingBox b {
            font-size: 16px;
          }

          .macroCards {
            grid-template-columns: repeat(4, 1fr);
            gap: 5px;
            margin-top: 10px;
          }

          .macroMini {
            min-height: 76px;
            border-radius: 11px;
            padding: 6px 4px;
            grid-template-columns: 20px 1fr;
            column-gap: 3px;
          }

          .macroMini span {
            font-size: 20px;
          }

          .macroMini b {
            font-size: 10.5px;
            line-height: 1.05;
            white-space: nowrap;
          }

          .macroMini strong {
            font-size: 17px;
            line-height: 1;
          }

          .macroMini i {
            height: 4px;
            margin-top: 5px;
          }

          .chartsGrid {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .chartCard {
            padding: 11px;
          }

          .chartCard h2 {
            font-size: 20px;
            margin-bottom: 8px;
          }

          .macroChart {
            grid-template-columns: 78px 1fr;
            gap: 6px;
            align-items: center;
          }

          .donut {
            width: 74px;
            height: 74px;
          }

          .donut::after {
            width: 46px;
            height: 46px;
          }

          .donut b {
            font-size: 11px;
            margin-top: 9px;
          }

          .donut span {
            font-size: 8px;
            margin-top: -15px;
          }

          .legend p {
            font-size: 10px;
            grid-template-columns: 8px 1fr 22px;
            gap: 4px;
            margin: 4px 0;
          }

          .legend i {
            width: 8px;
            height: 8px;
          }

          .bars {
            gap: 3px;
          }

          .bar div {
            height: 58px;
            margin-bottom: 4px;
          }

          .bar b,
          .bar span {
            font-size: 8.5px;
            line-height: 1.1;
          }

          .mealsCard h2 {
            font-size: 22px;
            margin-bottom: 8px;
          }

          .mealRow {
            grid-template-columns: minmax(0, 1fr) 58px 12px;
            gap: 4px;
            padding: 8px 44px 8px 2px;
          }

          .mealRow > div {
            gap: 8px;
          }

          .mealRow span {
            font-size: 22px;
          }

          .mealRow b {
            font-size: 16px;
            white-space: nowrap;
          }

          .mealRow strong {
            font-size: 15px;
            text-align: right;
            white-space: nowrap;
          }

          .mealRow em {
            font-size: 22px;
          }

          .bottomNav {
            min-height: 62px;
            border-radius: 18px;
            bottom: 8px;
          }

          .bottomNav button {
            font-size: 20px;
          }

          .bottomNav span {
            font-size: 10px;
          }
        }
      `}</style>
    </>
  );
}
