import React, { useEffect, useMemo, useState } from "react";

const MEALS = [
  { name: "Śniadanie", icon: "🍳" },
  { name: "Drugie śniadanie", icon: "🥪" },
  { name: "Obiad", icon: "🍲" },
  { name: "Podwieczorek", icon: "☕" },
  { name: "Kolacja", icon: "🥗" },
];

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function formatDate(dateKey) {
  return new Date(dateKey + "T12:00:00").toLocaleDateString("pl-PL", {
    weekday: "short",
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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMeals = localStorage.getItem("dianaPremiumMealsFinal");
    const savedGoal = localStorage.getItem("dianaPremiumGoalFinal");
    const savedTheme = localStorage.getItem("dianaPremiumDarkMode");

    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedGoal) setGoal(Number(savedGoal));
    if (savedTheme) setDarkMode(savedTheme === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("dianaPremiumMealsFinal", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("dianaPremiumGoalFinal", String(goal));
  }, [goal]);

  useEffect(() => {
    localStorage.setItem("dianaPremiumDarkMode", String(darkMode));
  }, [darkMode]);

  const selectedMeals = meals.filter((m) => m.date === selectedDate);

  const totals = useMemo(() => {
    return selectedMeals.reduce(
      (sum, meal) => ({
        kcal: sum.kcal + Number(meal.kcal || 0),
        protein: sum.protein + Number(meal.protein || 0),
        carbs: sum.carbs + Number(meal.carbs || 0),
        fat: sum.fat + Number(meal.fat || 0),
        fiber: sum.fiber + Number(meal.fiber || 0),
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [selectedMeals]);

  const weekDays = getLast7Days();
  const left = Math.max(goal - totals.kcal, 0);
  const progress = Math.min((totals.kcal / goal) * 100, 100);

  const weekData = weekDays.map((day) => ({
    day,
    kcal: meals
      .filter((m) => m.date === day)
      .reduce((s, m) => s + Number(m.kcal || 0), 0),
    label: new Date(day + "T12:00:00").toLocaleDateString("pl-PL", {
      weekday: "short",
    }),
  }));

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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, image, manualText, gramsText: weight, mealType }),
      });

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("AI zwróciło pustą albo błędną odpowiedź.");
      }

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
      ingredients: analysis.ingredients || [],
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
    setMeals((prev) => [{ ...meal, id: Date.now(), date: selectedDate }, ...prev]);
  }

  function saveEdit() {
    setMeals((prev) =>
      prev.map((meal) =>
        meal.id === editingMeal.id
          ? {
              ...editingMeal,
              kcal: Number(editingMeal.kcal || 0),
              protein: Number(editingMeal.protein || 0),
              carbs: Number(editingMeal.carbs || 0),
              fat: Number(editingMeal.fat || 0),
              fiber: Number(editingMeal.fiber || 0),
            }
          : meal
      )
    );
    setEditingMeal(null);
  }

  function copyYesterdayMeals() {
    const d = new Date(selectedDate + "T12:00:00");
    d.setDate(d.getDate() - 1);
    const yesterday = getDateKey(d);

    const yesterdayMeals = meals.filter((m) => m.date === yesterday);

    if (yesterdayMeals.length === 0) {
      alert("Nie ma posiłków z poprzedniego dnia.");
      return;
    }

    const copied = yesterdayMeals.map((m) => ({
      ...m,
      id: Date.now() + Math.random(),
      date: selectedDate,
    }));

    setMeals((prev) => [...copied, ...prev]);
  }

  return (
    <>
      <style>{css}</style>

      <main className={darkMode ? "page dark" : "page"}>
        <section className="hero">
          <div>
            <div className="topLine">
              <span>AI CALORIE TRACKER</span>
              <button onClick={() => setDarkMode(!darkMode)}>
                {darkMode ? "☀️ Jasny" : "🌙 Ciemny"}
              </button>
            </div>
            <h1>Kalorie AI Diana PRO</h1>
            <p>Zdjęcia posiłków, gramatura, makro, historia i wykresy — w wersji mobile premium.</p>
          </div>

          <div className="ring">
            <div>{Math.round(totals.kcal)}</div>
            <span>kcal</span>
          </div>
        </section>

        <section className="addPanel">
          <div className="sectionHead">
            <div>
              <h2>Dodaj posiłek</h2>
              <p>Rozpoznaj zdjęcie AI albo policz ręcznie.</p>
            </div>
          </div>

          <div className="modeSwitch">
            <button className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>
              Dodaj zdjęcie
            </button>
            <button className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>
              Policz ręcznie
            </button>
          </div>

          <div className="formGrid">
            <label>
              <span>Posiłek</span>
              <select value={mealType} onChange={(e) => setMealType(e.target.value)}>
                {MEALS.map((meal) => (
                  <option key={meal.name}>{meal.name}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Waga porcji</span>
              <div className="weightInput">
                <input value={weight} onChange={(e) => setWeight(e.target.value)} />
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
                  <div>🥕🍎</div>
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
              placeholder="Np. 2 ziemniaki, 150 g kurczaka, 3 marchewki..."
            />
          )}

          <button className="aiBtn" onClick={analyzeFood} disabled={loading}>
            {loading ? "Analizuję posiłek..." : "✨ Rozpoznaj posiłek AI"}
          </button>

          {analysis && (
            <div className="analysisCard">
              <div>
                <span>Wynik AI</span>
                <h3>{analysis.name || "Rozpoznany posiłek"}</h3>
                <p>{analysis.description}</p>
              </div>

              <div className="analysisKcal">
                <b>{Math.round(analysis.kcal || 0)}</b>
                <small>kcal</small>
              </div>

              <div className="miniMacros">
                <span>B {Math.round(analysis.protein || 0)} g</span>
                <span>W {Math.round(analysis.carbs || 0)} g</span>
                <span>T {Math.round(analysis.fat || 0)} g</span>
              </div>

              <button className="saveBtn" onClick={addToDiary}>
                Dodaj do dziennika
              </button>
            </div>
          )}
        </section>

        <section className="summary">
          <div className="dateScroller">
            {weekDays.map((day) => {
              const kcal = meals
                .filter((m) => m.date === day)
                .reduce((s, m) => s + Number(m.kcal || 0), 0);

              return (
                <button
                  key={day}
                  className={selectedDate === day ? "selected" : ""}
                  onClick={() => setSelectedDate(day)}
                >
                  <span>{formatDate(day)}</span>
                  <b>{Math.round(kcal)} kcal</b>
                </button>
              );
            })}
          </div>

          <div className="goalCard">
            <div>
              <span>Cel dzienny</span>
              <div className="goalInput">
                <input value={goal} onChange={(e) => setGoal(Number(e.target.value || 0))} />
                <b>kcal</b>
              </div>
            </div>

            <div className="leftBox">
              <span>Zostało</span>
              <b>{Math.round(left)} kcal</b>
            </div>

            <div className="progress">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="macroGrid">
            <Macro icon="💪" label="Białko" value={totals.protein} />
            <Macro icon="🌾" label="Węgle" value={totals.carbs} />
            <Macro icon="🥑" label="Tłuszcze" value={totals.fat} />
            <Macro icon="🥬" label="Błonnik" value={totals.fiber} />
          </div>
        </section>

        <section className="charts">
          <div className="chartCard">
            <h3>Makro</h3>
            <MacroChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
          </div>

          <div className="chartCard">
            <h3>7 dni</h3>
            <WeekChart data={weekData} max={maxWeekKcal} />
          </div>
        </section>

        <button className="copyBtn" onClick={copyYesterdayMeals}>
          Skopiuj posiłki z wczoraj
        </button>

        <section className="mealGrid">
          {MEALS.map((meal) => {
            const list = selectedMeals.filter((item) => item.mealType === meal.name);
            const kcal = list.reduce((sum, item) => sum + Number(item.kcal || 0), 0);

            return (
              <div className="mealCard" key={meal.name}>
                <div className="mealTop">
                  <div>
                    <span className="mealIcon">{meal.icon}</span>
                    <h3>{meal.name}</h3>
                  </div>
                  <b>{Math.round(kcal)} kcal</b>
                </div>

                {list.length === 0 ? (
                  <div className="emptyMeal">
                    <p>Dodaj pierwszy produkt</p>
                  </div>
                ) : (
                  list.map((item) => (
                    <div className="foodItem" key={item.id}>
                      {item.image && <img src={item.image} alt="" />}
                      <div>
                        <b>{item.name}</b>
                        <p>{item.description}</p>
                        <small>
                          {Math.round(item.kcal)} kcal · B {Math.round(item.protein)}g · W{" "}
                          {Math.round(item.carbs)}g · T {Math.round(item.fat)}g
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

        {editingMeal && (
          <div className="modalOverlay">
            <div className="modal">
              <h2>Edytuj posiłek</h2>

              <input
                value={editingMeal.name}
                onChange={(e) => setEditingMeal({ ...editingMeal, name: e.target.value })}
              />
              <input
                type="number"
                value={editingMeal.kcal}
                onChange={(e) => setEditingMeal({ ...editingMeal, kcal: e.target.value })}
              />

              <div className="modalGrid">
                <input
                  type="number"
                  value={editingMeal.protein}
                  onChange={(e) => setEditingMeal({ ...editingMeal, protein: e.target.value })}
                />
                <input
                  type="number"
                  value={editingMeal.carbs}
                  onChange={(e) => setEditingMeal({ ...editingMeal, carbs: e.target.value })}
                />
                <input
                  type="number"
                  value={editingMeal.fat}
                  onChange={(e) => setEditingMeal({ ...editingMeal, fat: e.target.value })}
                />
              </div>

              <div className="modalButtons">
                <button onClick={() => setEditingMeal(null)}>Anuluj</button>
                <button onClick={saveEdit}>Zapisz</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

function Macro({ icon, label, value }) {
  return (
    <div className="macro">
      <span>{icon}</span>
      <p>{label}</p>
      <b>{Math.round(value)} g</b>
    </div>
  );
}

function MacroChart({ protein, carbs, fat }) {
  const total = Number(protein || 0) + Number(carbs || 0) + Number(fat || 0);

  if (total <= 0) return <p className="emptyText">Dodaj posiłek, aby zobaczyć wykres.</p>;

  const proteinDeg = (protein / total) * 360;
  const carbsDeg = (carbs / total) * 360;
  const fatDeg = (fat / total) * 360;

  return (
    <div className="donutWrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(#06452f 0deg ${proteinDeg}deg, #74a95b ${proteinDeg}deg ${
            proteinDeg + carbsDeg
          }deg, #d9a84e ${proteinDeg + carbsDeg}deg ${proteinDeg + carbsDeg + fatDeg}deg)`,
        }}
      >
        <div>{Math.round(total)}g</div>
      </div>
    </div>
  );
}

function WeekChart({ data, max }) {
  return (
    <div className="weekChart">
      {data.map((item) => {
        const height = Math.max((item.kcal / max) * 100, item.kcal ? 10 : 3);

        return (
          <div className="barWrap" key={item.day}>
            <div className="barArea">
              <div className="bar" style={{ height: `${height}%` }} />
            </div>
            <span>{item.label}</span>
            <small>{Math.round(item.kcal)}</small>
          </div>
        );
      })}
    </div>
  );
}

const css = `
* { box-sizing: border-box; }

body {
  margin: 0;
  background: #edf5ee;
  color: #0d281b;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 14px;
  min-height: 100vh;
}

.page.dark {
  background: #07150f;
  color: #f4fff7;
}

.hero {
  background: radial-gradient(circle at top right, #18875a, #053621 60%);
  color: white;
  border-radius: 30px;
  padding: 24px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  box-shadow: 0 20px 45px rgba(5, 54, 33, .22);
}

.topLine {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  align-items: center;
}

.topLine span {
  font-size: 11px;
  letter-spacing: 2px;
  font-weight: 900;
  opacity: .75;
}

.topLine button {
  border: 1px solid rgba(255,255,255,.25);
  background: rgba(255,255,255,.12);
  color: white;
  border-radius: 999px;
  padding: 8px 11px;
  font-weight: 800;
}

.hero h1 {
  font-size: 34px;
  margin: 14px 0 8px;
  line-height: 1;
}

.hero p {
  margin: 0;
  color: rgba(255,255,255,.85);
  max-width: 640px;
}

.ring {
  min-width: 105px;
  height: 105px;
  border-radius: 30px;
  background: rgba(255,255,255,.14);
  border: 1px solid rgba(255,255,255,.18);
  display: grid;
  place-items: center;
  text-align: center;
}

.ring div {
  font-size: 34px;
  font-weight: 950;
  line-height: 1;
}

.ring span {
  font-size: 12px;
  opacity: .75;
}

.addPanel,
.goalCard,
.chartCard,
.mealCard,
.summary {
  background: rgba(255,255,255,.94);
  border-radius: 28px;
  box-shadow: 0 16px 38px rgba(14, 74, 47, .10);
  border: 1px solid rgba(7, 70, 44, .07);
}

.dark .addPanel,
.dark .goalCard,
.dark .chartCard,
.dark .mealCard,
.dark .summary {
  background: #10231a;
  border-color: rgba(255,255,255,.07);
}

.addPanel {
  margin-top: 16px;
  padding: 20px;
}

.sectionHead h2 {
  margin: 0;
  font-size: 28px;
}

.sectionHead p {
  margin: 5px 0 0;
  color: #6f8877;
  font-size: 17px;
}

.modeSwitch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 18px;
}

.modeSwitch button,
.aiBtn,
.saveBtn,
.copyBtn {
  border: none;
  cursor: pointer;
  font-weight: 900;
}

.modeSwitch button {
  border-radius: 18px;
  padding: 15px;
  background: #f8fcf8;
  border: 1px solid #d9e9dd;
  color: #0d281b;
}

.modeSwitch .active {
  background: linear-gradient(135deg, #05402a, #08734c);
  color: white;
  box-shadow: 0 12px 28px rgba(5, 64, 42, .22);
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}

label span {
  display: block;
  color: #66806d;
  font-weight: 950;
  margin-bottom: 7px;
}

select,
textarea,
.weightInput,
.modal input {
  width: 100%;
  border: 1px solid #d9e9dd;
  background: white;
  border-radius: 18px;
  padding: 14px;
  outline: none;
  font-size: 16px;
}

.weightInput {
  display: flex;
  align-items: center;
  gap: 8px;
}

.weightInput input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 18px;
  font-weight: 900;
}

textarea {
  margin-top: 14px;
  min-height: 120px;
  resize: vertical;
}

.uploadBox {
  margin-top: 14px;
  min-height: 250px;
  border-radius: 26px;
  background: #f3fbf4;
  border: 2px dashed #8bbd9e;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #24593b;
  overflow: hidden;
  cursor: pointer;
}

.uploadBox input { display: none; }

.uploadBox img {
  width: 100%;
  height: 290px;
  object-fit: cover;
}

.uploadInner div {
  font-size: 50px;
}

.uploadInner strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.uploadInner span {
  color: #6f8877;
  font-size: 14px;
}

.aiBtn {
  width: 100%;
  margin-top: 14px;
  padding: 18px;
  border-radius: 20px;
  color: white;
  font-size: 17px;
  background: linear-gradient(135deg, #022f1f, #068556);
  box-shadow: 0 16px 30px rgba(5, 64, 42, .25);
}

.analysisCard {
  margin-top: 16px;
  background: #f5fbf6;
  border: 1px solid #d9e9dd;
  border-radius: 24px;
  padding: 18px;
}

.analysisCard span {
  color: #6f8877;
  font-weight: 900;
}

.analysisCard h3 {
  margin: 6px 0;
  font-size: 23px;
}

.analysisKcal {
  margin-top: 12px;
  background: white;
  border-radius: 20px;
  padding: 16px;
  display: inline-block;
}

.analysisKcal b {
  font-size: 34px;
  color: #06452f;
}

.miniMacros {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.miniMacros span {
  background: white;
  color: #0d281b;
  border-radius: 999px;
  padding: 9px 12px;
}

.saveBtn {
  width: 100%;
  margin-top: 14px;
  padding: 15px;
  border-radius: 18px;
  background: #06452f;
  color: white;
}

.summary {
  margin-top: 16px;
  padding: 18px;
}

.dateScroller {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.dateScroller button {
  flex: 0 0 auto;
  min-width: 105px;
  border: 1px solid #d9e9dd;
  background: #f8fcf8;
  border-radius: 18px;
  padding: 12px;
  color: #0d281b;
}

.dateScroller .selected {
  background: #06452f;
  color: white;
}

.dateScroller span,
.dateScroller b {
  display: block;
}

.dateScroller span {
  font-size: 12px;
}

.dateScroller b {
  margin-top: 4px;
}

.goalCard {
  margin-top: 14px;
  padding: 18px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 14px;
}

.goalCard span {
  color: #6f8877;
  font-weight: 900;
}

.goalInput {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.goalInput input {
  width: 110px;
  border-radius: 16px;
  border: 1px solid #d9e9dd;
  padding: 12px;
  font-size: 18px;
  font-weight: 900;
}

.leftBox {
  background: #06452f;
  color: white;
  border-radius: 20px;
  padding: 15px 18px;
  text-align: center;
}

.leftBox span {
  color: rgba(255,255,255,.75);
}

.leftBox b {
  display: block;
  font-size: 22px;
  margin-top: 4px;
}

.progress {
  grid-column: 1 / -1;
  height: 12px;
  border-radius: 999px;
  background: #e2efe5;
  overflow: hidden;
}

.progress div {
  height: 100%;
  background: linear-gradient(90deg, #06452f, #77b75d);
}

.macroGrid {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.macro {
  background: #f8fcf8;
  border: 1px solid #d9e9dd;
  border-radius: 20px;
  padding: 14px;
  text-align: center;
}

.macro span {
  font-size: 20px;
}

.macro p {
  margin: 6px 0;
  color: #66806d;
  font-weight: 900;
}

.macro b {
  font-size: 23px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-top: 16px;
}

.chartCard {
  padding: 18px;
  min-height: 210px;
}

.chartCard h3 {
  margin: 0 0 12px;
  font-size: 22px;
}

.emptyText {
  color: #6f8877;
  font-size: 18px;
  line-height: 1.35;
}

.donutWrap {
  display: flex;
  justify-content: center;
  align-items: center;
}

.donut {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
}

.donut::after {
  content: "";
  width: 92px;
  height: 92px;
  background: white;
  border-radius: 50%;
  position: absolute;
}

.donut div {
  position: relative;
  z-index: 2;
  font-weight: 950;
  color: #06452f;
}

.weekChart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  min-height: 160px;
  align-items: end;
}

.barWrap {
  display: grid;
  gap: 5px;
  text-align: center;
}

.barArea {
  height: 115px;
  background: #eef6f0;
  border-radius: 999px;
  display: flex;
  align-items: end;
  overflow: hidden;
}

.bar {
  width: 100%;
  border-radius: 999px;
  background: linear-gradient(180deg, #06452f, #77b75d);
}

.barWrap span {
  font-size: 11px;
  font-weight: 900;
}

.barWrap small {
  font-size: 10px;
  color: #6f8877;
}

.copyBtn {
  width: 100%;
  margin-top: 14px;
  border-radius: 18px;
  padding: 14px;
  background: #dcece1;
  color: #06452f;
}

.mealGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-top: 16px;
}

.mealCard {
  padding: 18px;
}

.mealTop {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.mealTop h3 {
  display: inline;
  margin: 0 0 0 6px;
  font-size: 19px;
}

.mealTop b {
  color: #06452f;
}

.emptyMeal {
  margin-top: 18px;
  border-radius: 18px;
  background: #f6fbf7;
  padding: 16px;
  color: #6f8877;
  font-weight: 800;
}

.foodItem {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid #e2efe5;
  display: flex;
  gap: 12px;
}

.foodItem img {
  width: 62px;
  height: 62px;
  border-radius: 16px;
  object-fit: cover;
}

.foodItem p {
  margin: 4px 0;
  color: #6f8877;
}

.foodItem small {
  color: #66806d;
}

.itemActions {
  display: flex;
  gap: 7px;
  margin-top: 9px;
  flex-wrap: wrap;
}

.itemActions button {
  border: none;
  border-radius: 12px;
  padding: 8px 10px;
  background: #e8f3eb;
  color: #06452f;
  font-weight: 900;
}

.itemActions button:last-child {
  background: #ffe0dc;
  color: #a33122;
}

.modalOverlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  display: grid;
  place-items: center;
  padding: 16px;
  z-index: 10;
}

.modal {
  width: 100%;
  max-width: 520px;
  background: white;
  border-radius: 26px;
  padding: 22px;
}

.modal input {
  margin-top: 10px;
}

.modalGrid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.modalButtons {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.modalButtons button {
  border: none;
  border-radius: 16px;
  padding: 14px;
  font-weight: 900;
}

.modalButtons button:last-child {
  background: #06452f;
  color: white;
}

@media (max-width: 760px) {
  .page {
    padding: 10px;
  }

  .hero {
    border-radius: 24px;
    padding: 18px;
  }

  .hero h1 {
    font-size: 27px;
  }

  .hero p {
    font-size: 14px;
  }

  .ring {
    min-width: 88px;
    height: 88px;
    border-radius: 24px;
  }

  .ring div {
    font-size: 29px;
  }

  .addPanel {
    padding: 18px;
  }

  .sectionHead h2 {
    font-size: 29px;
  }

  .sectionHead p {
    font-size: 18px;
  }

  .formGrid {
    grid-template-columns: 1fr;
  }

  .uploadBox {
    min-height: 210px;
  }

  .macroGrid {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .chartCard {
    padding: 16px;
  }

  .chartCard h3 {
    font-size: 21px;
  }

  .emptyText {
    font-size: 16px;
  }

  .donut {
    width: 125px;
    height: 125px;
  }

  .donut::after {
    width: 78px;
    height: 78px;
  }

  .mealGrid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .mealCard {
    padding: 14px;
  }

  .mealTop {
    display: block;
  }

  .mealTop h3 {
    font-size: 16px;
  }

  .emptyMeal {
    padding: 12px;
    font-size: 14px;
  }

  .foodItem {
    flex-direction: column;
  }
}

@media (max-width: 430px) {
  .hero {
    display: block;
  }

  .ring {
    margin-top: 14px;
    width: 100%;
  }

  .charts {
    grid-template-columns: 1fr;
  }

  .mealGrid {
    grid-template-columns: 1fr;
  }
}
`;