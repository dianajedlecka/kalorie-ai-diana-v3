import React, { useEffect, useMemo, useState } from "react";

const MEALS = ["Śniadanie", "Drugie śniadanie", "Obiad", "Podwieczorek", "Kolacja"];

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Date(dateKey + "T12:00:00").toLocaleDateString("pl-PL", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
  });
}

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(getDateKey(d));
  }
  return days;
}

export default function App() {
  const [mode, setMode] = useState("photo");
  const [mealType, setMealType] = useState("Śniadanie");
  const [weight, setWeight] = useState("200");
  const [manualText, setManualText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [meals, setMeals] = useState([]);
  const [goal, setGoal] = useState(2000);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [editingMeal, setEditingMeal] = useState(null);

  useEffect(() => {
    const savedMeals = localStorage.getItem("dianaPremiumMeals");
    const savedGoal = localStorage.getItem("dianaPremiumGoal");

    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedGoal) setGoal(Number(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem("dianaPremiumMeals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("dianaPremiumGoal", String(goal));
  }, [goal]);

  const selectedMeals = meals.filter((m) => m.date === selectedDate);

  const totals = useMemo(() => {
    return selectedMeals.reduce(
      (sum, meal) => ({
        kcal: sum.kcal + Number(meal.kcal || 0),
        protein: sum.protein + Number(meal.protein || 0),
        carbs: sum.carbs + Number(meal.carbs || 0),
        fat: sum.fat + Number(meal.fat || 0),
        fiber: sum.fiber + Number(meal.fiber || 0),
        sugar: sum.sugar + Number(meal.sugar || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 }
    );
  }, [selectedMeals]);

  const left = Math.max(goal - totals.kcal, 0);
  const progress = Math.min((totals.kcal / goal) * 100, 100);
  const weekDays = getLast7Days();

  const weekData = weekDays.map((day) => {
    const sum = meals
      .filter((m) => m.date === day)
      .reduce((acc, m) => acc + Number(m.kcal || 0), 0);

    return {
      day,
      kcal: sum,
      label: new Date(day + "T12:00:00").toLocaleDateString("pl-PL", {
        weekday: "short",
      }),
    };
  });

  const maxWeekKcal = Math.max(...weekData.map((d) => d.kcal), goal, 1);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(null);
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function analyzeFood() {
    if (mode === "photo" && !imageFile) {
      alert("Najpierw dodaj zdjęcie potrawy.");
      return;
    }

    if (mode === "manual" && !manualText.trim()) {
      alert("Wpisz produkty, np. 2 ziemniaki, 150 g kurczaka.");
      return;
    }

    setLoading(true);
    setAnalysis(null);

    try {
      const image = imageFile ? await fileToBase64(imageFile) : null;

      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mode,
          image,
          manualText,
          gramsText: weight,
          mealType
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert("Błąd: " + (data.error || "AI nie odpowiedziało"));
        return;
      }

      setAnalysis(data);
    } catch (error) {
      alert("Błąd: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  function addToDiary() {
    if (!analysis) return;

    const item = {
      id: Date.now(),
      date: selectedDate,
      mealType,
      image: preview,
      name: analysis.name || "Posiłek",
      description: analysis.description || "",
      kcal: Number(analysis.kcal || 0),
      protein: Number(analysis.protein || 0),
      carbs: Number(analysis.carbs || 0),
      fat: Number(analysis.fat || 0),
      fiber: Number(analysis.fiber || 0),
      sugar: Number(analysis.sugar || 0),
      ingredients: analysis.ingredients || [],
      note: analysis.note || "Wynik jest szacunkowy."
    };

    setMeals((prev) => [item, ...prev]);
    setAnalysis(null);
    setManualText("");
    setImageFile(null);
    setPreview("");
  }

  function removeMeal(id) {
    setMeals((prev) => prev.filter((meal) => meal.id !== id));
  }

  function duplicateMeal(meal) {
    const copy = {
      ...meal,
      id: Date.now(),
      date: selectedDate,
    };

    setMeals((prev) => [copy, ...prev]);
  }

  function saveEdit() {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === editingMeal.id
          ? {
              ...meal,
              ...editingMeal,
              kcal: Number(editingMeal.kcal || 0),
              protein: Number(editingMeal.protein || 0),
              carbs: Number(editingMeal.carbs || 0),
              fat: Number(editingMeal.fat || 0),
              fiber: Number(editingMeal.fiber || 0),
              sugar: Number(editingMeal.sugar || 0),
            }
          : meal
      )
    );

    setEditingMeal(null);
  }

  function clearDay() {
    if (!window.confirm("Usunąć posiłki z wybranego dnia?")) return;
    setMeals((prev) => prev.filter((meal) => meal.date !== selectedDate));
  }

  return (
    <>
      <style>{css}</style>

      <main className="page">
        <section className="topbar">
          <div>
            <div className="eyebrow">AI CALORIE TRACKER</div>
            <h1>Kalorie AI Diana PRO</h1>
            <p>
              Profesjonalny dziennik żywieniowy z analizą zdjęć, gramaturą,
              makro, historią dni i wykresami.
            </p>
          </div>

          <div className="topScore">
            <span>{formatDate(selectedDate)}</span>
            <strong>{Math.round(totals.kcal)}</strong>
            <small>kcal</small>
          </div>
        </section>

        <section className="datePanel">
          <h2>Historia dni</h2>

          <div className="dateChips">
            {weekDays.map((day) => (
              <button
                key={day}
                className={selectedDate === day ? "selected" : ""}
                onClick={() => setSelectedDate(day)}
              >
                <span>{formatDate(day).split(",")[0]}</span>
                <b>
                  {meals
                    .filter((m) => m.date === day)
                    .reduce((s, m) => s + Number(m.kcal || 0), 0)}{" "}
                  kcal
                </b>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard">
          <div className="goalCard">
            <div className="goalTop">
              <div>
                <span className="muted">Cel dzienny</span>
                <div className="goalInputRow">
                  <input
                    value={goal}
                    onChange={(e) => setGoal(Number(e.target.value || 0))}
                  />
                  <b>kcal</b>
                </div>
              </div>

              <div className="leftBox">
                <span>Zostało</span>
                <strong>{Math.round(left)} kcal</strong>
              </div>
            </div>

            <div className="progress">
              <div style={{ width: `${progress}%` }} />
            </div>

            <div className="macroGrid">
              <Macro label="Białko" value={totals.protein} />
              <Macro label="Węglowodany" value={totals.carbs} />
              <Macro label="Tłuszcze" value={totals.fat} />
              <Macro label="Błonnik" value={totals.fiber} />
            </div>
          </div>
        </section>

        <section className="chartsGrid">
          <div className="chartCard">
            <h2>Makroskładniki</h2>
            <MacroChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
          </div>

          <div className="chartCard">
            <h2>Kalorie z 7 dni</h2>
            <WeekChart data={weekData} max={maxWeekKcal} />
          </div>
        </section>

        <section className="panel">
          <div className="panelHeader">
            <div>
              <h2>Dodaj posiłek</h2>
              <p>Najpierw rozpoznaj AI, potem zapisz do dziennika.</p>
            </div>
          </div>

          <div className="modeSwitch">
            <button
              className={mode === "photo" ? "active" : ""}
              onClick={() => {
                setMode("photo");
                setAnalysis(null);
              }}
            >
              Dodaj zdjęcie
            </button>
            <button
              className={mode === "manual" ? "active" : ""}
              onClick={() => {
                setMode("manual");
                setAnalysis(null);
              }}
            >
              Policz ręcznie
            </button>
          </div>

          <div className="formGrid">
            <label>
              <span>Posiłek</span>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
              >
                {MEALS.map((meal) => (
                  <option key={meal}>{meal}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Waga porcji</span>
              <div className="weightInput">
                <input
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="np. 250"
                />
                <b>g</b>
              </div>
            </label>
          </div>

          {mode === "photo" ? (
            <label className="uploadBox">
              {preview ? (
                <img src={preview} alt="Podgląd potrawy" />
              ) : (
                <div className="uploadInner">
                  <div className="foodIcon">🥕🍎</div>
                  <strong>Dodaj zdjęcie potrawy</strong>
                  <span>AI rozpozna składniki, kcal i makro</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>
          ) : (
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Np. 2 ziemniaki, 150 g kurczaka, 3 marchewki, łyżka oliwy..."
            />
          )}

          <button className="primaryBtn" onClick={analyzeFood} disabled={loading}>
            {loading ? "Analizuję posiłek..." : "Rozpoznaj AI"}
          </button>

          {analysis && (
            <section className="analysisCard">
              <div className="analysisTop">
                <div>
                  <span className="muted">Wynik analizy</span>
                  <h3>{analysis.name || "Rozpoznany posiłek"}</h3>
                  <p>{analysis.description}</p>
                </div>

                <div className="analysisKcal">
                  <strong>{Math.round(analysis.kcal || 0)}</strong>
                  <span>kcal</span>
                </div>
              </div>

              <div className="analysisMacros">
                <span>Białko: {Math.round(analysis.protein || 0)} g</span>
                <span>Węgle: {Math.round(analysis.carbs || 0)} g</span>
                <span>Tłuszcze: {Math.round(analysis.fat || 0)} g</span>
              </div>

              {analysis.ingredients?.length > 0 && (
                <div className="ingredients">
                  <h4>Składniki</h4>
                  {analysis.ingredients.map((item, index) => (
                    <div key={index}>
                      <span>
                        {item.name} {item.amount ? `— ${item.amount}` : ""}
                      </span>
                      <b>{Math.round(item.kcal || 0)} kcal</b>
                    </div>
                  ))}
                </div>
              )}

              <button className="saveBtn" onClick={addToDiary}>
                Dodaj do dziennika
              </button>
            </section>
          )}
        </section>

        <section className="mealGrid">
          {MEALS.map((meal) => {
            const list = selectedMeals.filter((item) => item.mealType === meal);
            const kcal = list.reduce((sum, item) => sum + Number(item.kcal || 0), 0);

            return (
              <div className="mealCard" key={meal}>
                <div className="mealHead">
                  <h3>{meal}</h3>
                  <strong>{Math.round(kcal)} kcal</strong>
                </div>

                {list.length === 0 ? (
                  <p className="empty">Brak dodanych produktów.</p>
                ) : (
                  list.map((item) => (
                    <div className="foodItem" key={item.id}>
                      {item.image && <img src={item.image} alt="" />}

                      <div>
                        <b>{item.name}</b>
                        <p>{item.description}</p>
                        <small>
                          {Math.round(item.kcal)} kcal · B{" "}
                          {Math.round(item.protein)}g · W{" "}
                          {Math.round(item.carbs)}g · T{" "}
                          {Math.round(item.fat)}g
                        </small>

                        <div className="itemActions">
                          <button onClick={() => setEditingMeal(item)}>Edytuj</button>
                          <button onClick={() => duplicateMeal(item)}>Kopiuj</button>
                          <button onClick={() => removeMeal(item.id)}>Usuń</button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </section>

        <button className="clearBtn" onClick={clearDay}>
          Wyczyść wybrany dzień
        </button>

        {editingMeal && (
          <div className="modalOverlay">
            <div className="modal">
              <h2>Edytuj posiłek</h2>

              <label>
                <span>Nazwa</span>
                <input
                  value={editingMeal.name}
                  onChange={(e) =>
                    setEditingMeal({ ...editingMeal, name: e.target.value })
                  }
                />
              </label>

              <label>
                <span>Kalorie</span>
                <input
                  type="number"
                  value={editingMeal.kcal}
                  onChange={(e) =>
                    setEditingMeal({ ...editingMeal, kcal: e.target.value })
                  }
                />
              </label>

              <div className="modalGrid">
                <label>
                  <span>Białko</span>
                  <input
                    type="number"
                    value={editingMeal.protein}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, protein: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Węgle</span>
                  <input
                    type="number"
                    value={editingMeal.carbs}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, carbs: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span>Tłuszcze</span>
                  <input
                    type="number"
                    value={editingMeal.fat}
                    onChange={(e) =>
                      setEditingMeal({ ...editingMeal, fat: e.target.value })
                    }
                  />
                </label>
              </div>

              <div className="modalButtons">
                <button onClick={() => setEditingMeal(null)}>Anuluj</button>
                <button onClick={saveEdit}>Zapisz zmiany</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Macro({ label, value }) {
  return (
    <div className="macro">
      <span>{label}</span>
      <strong>{Math.round(value)} g</strong>
    </div>
  );
}

function MacroChart({ protein, carbs, fat }) {
  const total = Number(protein || 0) + Number(carbs || 0) + Number(fat || 0);

  if (total <= 0) {
    return <p className="empty">Dodaj posiłek, aby zobaczyć wykres makro.</p>;
  }

  const proteinDeg = (protein / total) * 360;
  const carbsDeg = (carbs / total) * 360;
  const fatDeg = (fat / total) * 360;

  const chartStyle = {
    background: `conic-gradient(
      #0b4a32 0deg ${proteinDeg}deg,
      #79a85a ${proteinDeg}deg ${proteinDeg + carbsDeg}deg,
      #d7a94b ${proteinDeg + carbsDeg}deg ${proteinDeg + carbsDeg + fatDeg}deg
    )`
  };

  return (
    <div className="macroChartWrap">
      <div className="donut" style={chartStyle}>
        <div>{Math.round(total)}g</div>
      </div>

      <div className="legend">
        <span><b className="dot protein"></b>Białko</span>
        <span><b className="dot carbs"></b>Węgle</span>
        <span><b className="dot fat"></b>Tłuszcze</span>
      </div>
    </div>
  );
}

function WeekChart({ data, max }) {
  return (
    <div className="weekChart">
      {data.map((item) => {
        const height = Math.max((item.kcal / max) * 100, item.kcal > 0 ? 8 : 2);

        return (
          <button className="barWrap" key={item.day} title={`${item.kcal} kcal`}>
            <div className="barArea">
              <div className="bar" style={{ height: `${height}%` }}></div>
            </div>
            <span>{item.label}</span>
            <small>{Math.round(item.kcal)}</small>
          </button>
        );
      })}
    </div>
  );
}

const css = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: #eef4ef;
  color: #10291c;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.page {
  max-width: 1120px;
  margin: 0 auto;
  padding: 22px;
}

.topbar {
  background: linear-gradient(135deg, #063f2a, #0d5d3d);
  color: white;
  border-radius: 34px;
  padding: 34px;
  display: flex;
  justify-content: space-between;
  gap: 22px;
  align-items: center;
  box-shadow: 0 24px 60px rgba(6, 63, 42, .26);
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 2.5px;
  font-weight: 900;
  opacity: .76;
}

.topbar h1 {
  font-size: 46px;
  line-height: 1;
  margin: 12px 0 10px;
}

.topbar p {
  margin: 0;
  font-size: 17px;
  max-width: 650px;
  opacity: .9;
}

.topScore {
  min-width: 160px;
  background: rgba(255,255,255,.12);
  border: 1px solid rgba(255,255,255,.18);
  border-radius: 28px;
  padding: 22px;
  text-align: center;
}

.topScore span,
.topScore small {
  display: block;
  opacity: .8;
}

.topScore strong {
  display: block;
  font-size: 44px;
  line-height: 1;
  margin: 6px 0;
}

.datePanel,
.goalCard,
.panel,
.mealCard,
.chartCard {
  background: rgba(255,255,255,.94);
  border: 1px solid rgba(18, 64, 40, .08);
  border-radius: 30px;
  box-shadow: 0 18px 45px rgba(15, 90, 55, .10);
}

.datePanel {
  margin-top: 20px;
  padding: 22px;
}

.datePanel h2 {
  margin-top: 0;
}

.dateChips {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.dateChips button {
  border: 1px solid #d5e5d8;
  background: #f8fcf8;
  border-radius: 18px;
  padding: 12px;
  color: #10291c;
  cursor: pointer;
}

.dateChips button.selected {
  background: #0b4a32;
  color: white;
  border: none;
}

.dateChips span,
.dateChips b {
  display: block;
}

.dateChips span {
  font-size: 12px;
}

.dateChips b {
  margin-top: 4px;
}

.dashboard,
.panel,
.mealCard {
  margin-top: 20px;
}

.goalCard {
  padding: 26px;
}

.goalTop {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: center;
  flex-wrap: wrap;
}

.muted {
  color: #5c7a65;
  font-size: 13px;
  font-weight: 800;
}

.goalInputRow {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.goalInputRow input {
  width: 120px;
  border: 1px solid #cfe0d3;
  border-radius: 18px;
  padding: 13px 15px;
  font-size: 20px;
  font-weight: 900;
  color: #10291c;
}

.leftBox {
  background: #0b4a32;
  color: white;
  border-radius: 24px;
  padding: 18px 24px;
  text-align: center;
}

.leftBox span {
  display: block;
  font-size: 13px;
  opacity: .8;
}

.leftBox strong {
  display: block;
  font-size: 24px;
  margin-top: 4px;
}

.progress {
  height: 14px;
  border-radius: 999px;
  background: #dce9df;
  margin-top: 22px;
  overflow: hidden;
}

.progress div {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #0b4a32, #61a84f);
}

.macroGrid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.macro {
  background: #f4faf5;
  border: 1px solid #d7e8db;
  border-radius: 22px;
  padding: 17px;
  text-align: center;
}

.macro span,
.macro strong {
  display: block;
}

.macro span {
  color: #5c7a65;
  font-weight: 800;
  font-size: 13px;
}

.macro strong {
  font-size: 21px;
  margin-top: 5px;
}

.chartsGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 20px;
}

.chartCard {
  padding: 22px;
}

.chartCard h2 {
  margin-top: 0;
}

.macroChartWrap {
  display: flex;
  align-items: center;
  gap: 24px;
}

.donut {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
}

.donut::after {
  content: "";
  width: 96px;
  height: 96px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.donut div {
  position: relative;
  z-index: 2;
  font-weight: 900;
  color: #0b4a32;
}

.legend {
  display: grid;
  gap: 10px;
}

.legend span {
  font-weight: 800;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 99px;
  display: inline-block;
  margin-right: 8px;
}

.dot.protein { background: #0b4a32; }
.dot.carbs { background: #79a85a; }
.dot.fat { background: #d7a94b; }

.weekChart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  align-items: end;
  min-height: 210px;
}

.barWrap {
  border: none;
  background: transparent;
  display: grid;
  gap: 6px;
  color: #10291c;
  cursor: pointer;
}

.barArea {
  height: 145px;
  background: #edf4ee;
  border-radius: 999px;
  display: flex;
  align-items: end;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #0b4a32, #79a85a);
  border-radius: 999px;
}

.barWrap span {
  font-size: 12px;
  font-weight: 800;
}

.barWrap small {
  color: #5c7a65;
}

.panel {
  padding: 26px;
}

.panelHeader h2 {
  margin: 0;
  font-size: 32px;
}

.panelHeader p {
  margin: 6px 0 0;
  color: #5c7a65;
}

.modeSwitch {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.modeSwitch button {
  border: 1px solid #d5e5d8;
  border-radius: 20px;
  padding: 16px;
  background: #f8fcf8;
  color: #10291c;
  font-weight: 900;
  cursor: pointer;
  font-size: 15px;
}

.modeSwitch button.active {
  color: white;
  background: linear-gradient(135deg, #063f2a, #0d5d3d);
  border: none;
  box-shadow: 0 14px 30px rgba(6,63,42,.20);
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 16px;
}

label span {
  display: block;
  color: #5c7a65;
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 8px;
}

select,
textarea,
.weightInput,
.modal input {
  width: 100%;
  border: 1px solid #d5e5d8;
  border-radius: 20px;
  background: white;
  padding: 15px 16px;
  font-size: 16px;
  color: #10291c;
  outline: none;
}

.weightInput {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weightInput input {
  border: none;
  outline: none;
  flex: 1;
  font-size: 18px;
  font-weight: 900;
  width: 100%;
}

textarea {
  margin-top: 16px;
  min-height: 135px;
  resize: vertical;
}

.uploadBox {
  margin-top: 16px;
  min-height: 290px;
  border: 2px dashed #8cbea0;
  border-radius: 28px;
  background: #f5fbf6;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #245c39;
  cursor: pointer;
  overflow: hidden;
}

.uploadBox input {
  display: none;
}

.uploadBox img {
  width: 100%;
  height: 320px;
  object-fit: cover;
}

.uploadInner {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.foodIcon {
  font-size: 58px;
}

.uploadInner strong {
  font-size: 20px;
}

.uploadInner span {
  color: #5c7a65;
}

.primaryBtn,
.saveBtn,
.clearBtn {
  border: none;
  cursor: pointer;
  font-weight: 900;
}

.primaryBtn {
  width: 100%;
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: linear-gradient(135deg, #063f2a, #0d5d3d);
  color: white;
  font-size: 17px;
  box-shadow: 0 16px 34px rgba(6,63,42,.22);
}

.analysisCard {
  margin-top: 20px;
  padding: 22px;
  border-radius: 26px;
  background: #f4faf5;
  border: 1px solid #d7e8db;
}

.analysisTop {
  display: flex;
  justify-content: space-between;
  gap: 18px;
}

.analysisTop h3 {
  margin: 6px 0;
  font-size: 25px;
}

.analysisTop p {
  color: #4b6b55;
}

.analysisKcal {
  min-width: 120px;
  height: 120px;
  border-radius: 28px;
  background: white;
  border: 1px solid #d7e8db;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.analysisKcal strong {
  font-size: 35px;
  color: #0b4a32;
}

.analysisMacros {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.analysisMacros span {
  background: white;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 900;
  border: 1px solid #d7e8db;
}

.ingredients {
  margin-top: 16px;
}

.ingredients h4 {
  margin-bottom: 8px;
}

.ingredients div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #dce9df;
}

.saveBtn {
  width: 100%;
  margin-top: 18px;
  padding: 16px;
  border-radius: 20px;
  background: #0b4a32;
  color: white;
  font-size: 16px;
}

.mealGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
  margin-top: 20px;
}

.mealCard {
  padding: 22px;
}

.mealHead {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.mealHead h3 {
  margin: 0;
}

.mealHead strong {
  color: #0b4a32;
}

.empty {
  color: #7d9583;
  margin-bottom: 0;
}

.foodItem {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  border-top: 1px solid #e3eee6;
  padding-top: 14px;
  margin-top: 14px;
}

.foodItem img {
  width: 66px;
  height: 66px;
  object-fit: cover;
  border-radius: 18px;
}

.foodItem p {
  margin: 4px 0;
  color: #4b6b55;
}

.foodItem small {
  color: #5c7a65;
}

.itemActions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.itemActions button {
  border: none;
  border-radius: 12px;
  padding: 8px 10px;
  background: #edf4ee;
  color: #0b4a32;
  cursor: pointer;
  font-weight: 800;
}

.itemActions button:last-child {
  background: #fee1dd;
  color: #a33122;
}

.clearBtn {
  width: 100%;
  margin-top: 20px;
  padding: 16px;
  border-radius: 22px;
  background: #dce9df;
  color: #10291c;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.35);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 10;
}

.modal {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 28px;
  padding: 24px;
  box-shadow: 0 30px 80px rgba(0,0,0,.25);
}

.modal h2 {
  margin-top: 0;
}

.modal label {
  display: block;
  margin-top: 12px;
}

.modalGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.modalButtons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 18px;
}

.modalButtons button {
  border: none;
  border-radius: 18px;
  padding: 14px;
  font-weight: 900;
  cursor: pointer;
}

.modalButtons button:last-child {
  background: #0b4a32;
  color: white;
}

@media (max-width: 760px) {
  .page {
    padding: 12px;
  }

  .topbar {
    border-radius: 26px;
    padding: 26px;
    display: block;
  }

  .topbar h1 {
    font-size: 34px;
  }

  .topScore {
    margin-top: 18px;
    width: 100%;
  }

  .dateChips {
    grid-template-columns: repeat(2, 1fr);
  }

  .goalTop {
    display: block;
  }

  .leftBox {
    margin-top: 14px;
  }

  .macroGrid,
  .formGrid,
  .modeSwitch,
  .mealGrid,
  .chartsGrid,
  .modalGrid {
    grid-template-columns: 1fr;
  }

  .panel,
  .goalCard,
  .mealCard,
  .chartCard,
  .datePanel {
    border-radius: 24px;
    padding: 20px;
  }

  .analysisTop {
    display: block;
  }

  .analysisKcal {
    margin-top: 14px;
    width: 100%;
  }

  .foodItem {
    flex-direction: column;
  }

  .macroChartWrap {
    flex-direction: column;
    align-items: flex-start;
  }

  .weekChart {
    min-height: 180px;
  }
}
`;