import React, { useEffect, useMemo, useState } from "react";

const MEALS = [
  { name: "Śniadanie", icon: "🍳" },
  { name: "Drugie śniadanie", icon: "🥪" },
  { name: "Obiad", icon: "🍲" },
  { name: "Podwieczorek", icon: "☕" },
  { name: "Kolacja", icon: "🥗" },
];

const CONDITIONS = [
  { key: "hashimoto", label: "Hashimoto" },
  { key: "pcos", label: "PCOS" },
  { key: "insulin", label: "Insulinooporność" },
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

function healthOpinion(type, food) {
  const kcal = Number(food?.kcal || 0);
  const protein = Number(food?.protein || 0);
  const carbs = Number(food?.carbs || 0);
  const fat = Number(food?.fat || 0);
  const fiber = Number(food?.fiber || 0);
  const name = `${food?.name || ""} ${food?.description || ""}`.toLowerCase();

  const hasSugar = /cukier|słod|ciasto|deser|sok|cola|baton|czekolad|drożdż|biały chleb|bułka/.test(name);
  const hasProtein = protein >= 18;
  const highCarbs = carbs >= 55;
  const goodFiber = fiber >= 5;

  if (type === "insulin") {
    if (hasSugar || highCarbs) {
      return {
        status: "Ostrożnie",
        className: "warn",
        text: "Posiłek może być mniej korzystny przy insulinooporności, bo ma dużo węglowodanów lub składników szybko podnoszących glukozę.",
        tip: "Dodaj więcej białka, warzyw i błonnika albo zmniejsz porcję węglowodanów.",
      };
    }
    if (hasProtein && goodFiber) {
      return {
        status: "Dobry wybór",
        className: "good",
        text: "Posiłek wygląda korzystnie: zawiera białko i błonnik, co może pomagać w stabilniejszej glikemii.",
        tip: "Utrzymaj podobną kompozycję: białko + warzywa + rozsądna porcja węglowodanów.",
      };
    }
    return {
      status: "Średnio",
      className: "mid",
      text: "Posiłek może być neutralny, ale warto dopilnować ilości białka i błonnika.",
      tip: "Dobrym dodatkiem będą warzywa, jogurt naturalny, jajko, ryba lub chude mięso.",
    };
  }

  if (type === "pcos") {
    if (hasSugar || highCarbs) {
      return {
        status: "Ostrożnie",
        className: "warn",
        text: "Przy PCOS często lepiej unikać posiłków z dużą ilością cukru i prostych węglowodanów.",
        tip: "Wybierz więcej białka, warzyw i tłuszczów dobrej jakości.",
      };
    }
    if (hasProtein && carbs <= 45) {
      return {
        status: "Dobry wybór",
        className: "good",
        text: "Posiłek wygląda dobrze pod kątem PCOS: ma sensowną ilość białka i nie jest przesadnie węglowodanowy.",
        tip: "To dobry kierunek: regularne posiłki i stabilna energia.",
      };
    }
    return {
      status: "Do poprawy",
      className: "mid",
      text: "Posiłek może być OK, ale warto zadbać o lepszy balans białka, tłuszczu i błonnika.",
      tip: "Dodaj źródło białka i warzywa.",
    };
  }

  if (type === "hashimoto") {
    if (kcal < 250 || protein < 12) {
      return {
        status: "Do uzupełnienia",
        className: "mid",
        text: "Przy Hashimoto często ważna jest regularność i odpowiednia ilość białka. Ten posiłek może być zbyt lekki.",
        tip: "Dodaj białko: jajka, rybę, mięso, twaróg, jogurt naturalny albo tofu.",
      };
    }
    return {
      status: "Raczej OK",
      className: "good",
      text: "Posiłek wygląda rozsądnie jako element zbilansowanej diety.",
      tip: "Warto dbać o białko, warzywa, produkty mało przetworzone i regularność.",
    };
  }

  return null;
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
  const [selectedCondition, setSelectedCondition] = useState("insulin");

  useEffect(() => {
    const savedMeals = localStorage.getItem("fitHealthMeals");
    const savedGoal = localStorage.getItem("fitHealthGoal");
    if (savedMeals) setMeals(JSON.parse(savedMeals));
    if (savedGoal) setGoal(Number(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem("fitHealthMeals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("fitHealthGoal", String(goal));
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
      }),
      { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  }, [selectedMeals]);

  const weekDays = getLast7Days();
  const left = Math.max(goal - totals.kcal, 0);
  const progress = Math.min((totals.kcal / goal) * 100, 100);

  const weekData = weekDays.map((day) => ({
    day,
    kcal: meals.filter((m) => m.date === day).reduce((s, m) => s + Number(m.kcal || 0), 0),
    label: new Date(day + "T12:00:00").toLocaleDateString("pl-PL", { weekday: "short" }),
  }));

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
    if (mode === "photo" && !imageFile) return alert("Najpierw dodaj zdjęcie potrawy.");
    if (mode === "manual" && !manualText.trim()) return alert("Wpisz produkty.");

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
      const data = JSON.parse(text);

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

  const latestFood = analysis || selectedMeals[0];
  const opinion = latestFood ? healthOpinion(selectedCondition, latestFood) : null;

  return (
    <>
      <style>{css}</style>

      <main className="page">
        <section className="hero">
          <div className="heroOverlay">
            <div className="eyebrow">FIT & HEALTH TRACKER</div>
            <h1>Fit and Health by Diana</h1>
            <p>Analiza posiłków, kalorii, makro i orientacyjna ocena dla Hashimoto, PCOS oraz insulinooporności.</p>
          </div>

          <div className="heroScore">
            <span>Dzisiaj</span>
            <b>{Math.round(totals.kcal)}</b>
            <small>kcal</small>
          </div>
        </section>

        <section className="addPanel">
          <div className="sectionTitle">
            <h2>Dodaj posiłek</h2>
            <p>Zdjęcie, gramatura i analiza AI w jednym miejscu.</p>
          </div>

          <div className="modeSwitch">
            <button className={mode === "photo" ? "active" : ""} onClick={() => setMode("photo")}>
              Zdjęcie
            </button>
            <button className={mode === "manual" ? "active" : ""} onClick={() => setMode("manual")}>
              Ręcznie
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
                  <div>🥗</div>
                  <strong>Dodaj zdjęcie potrawy</strong>
                  <span>AI rozpozna kcal, makro i składniki</span>
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
            {loading ? "Analizuję..." : "Rozpoznaj posiłek AI"}
          </button>

          {analysis && (
            <div className="analysisCard">
              <div>
                <span>Wynik AI</span>
                <h3>{analysis.name || "Rozpoznany posiłek"}</h3>
                <p>{analysis.description}</p>
              </div>

              <div className="analysisStats">
                <b>{Math.round(analysis.kcal || 0)} kcal</b>
                <span>B {Math.round(analysis.protein || 0)}g</span>
                <span>W {Math.round(analysis.carbs || 0)}g</span>
                <span>T {Math.round(analysis.fat || 0)}g</span>
              </div>

              <button className="saveBtn" onClick={addToDiary}>Dodaj do dziennika</button>
            </div>
          )}
        </section>

        <section className="healthPanel">
          <div className="sectionTitle compact">
            <h2>Ocena zdrowotna posiłku</h2>
            <p>Orientacyjna ocena — nie zastępuje lekarza ani dietetyka.</p>
          </div>

          <div className="conditionTabs">
            {CONDITIONS.map((c) => (
              <button
                key={c.key}
                className={selectedCondition === c.key ? "active" : ""}
                onClick={() => setSelectedCondition(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>

          {opinion ? (
            <div className={`opinion ${opinion.className}`}>
              <strong>{opinion.status}</strong>
              <p>{opinion.text}</p>
              <small>{opinion.tip}</small>
            </div>
          ) : (
            <div className="opinion empty">
              <strong>Dodaj posiłek</strong>
              <p>Po analizie zdjęcia zobaczysz ocenę dla Hashimoto, PCOS i insulinooporności.</p>
            </div>
          )}
        </section>

        <section className="summaryPanel">
          <div className="dateScroller">
            {weekDays.map((day) => {
              const kcal = meals.filter((m) => m.date === day).reduce((s, m) => s + Number(m.kcal || 0), 0);

              return (
                <button key={day} className={selectedDate === day ? "selected" : ""} onClick={() => setSelectedDate(day)}>
                  <span>{formatDate(day)}</span>
                  <b>{Math.round(kcal)} kcal</b>
                </button>
              );
            })}
          </div>

          <div className="goalRow">
            <div>
              <span>Cel</span>
              <div className="goalInput">
                <input value={goal} onChange={(e) => setGoal(Number(e.target.value || 0))} />
                <b>kcal</b>
              </div>
            </div>

            <div className="leftBox">
              <span>Zostało</span>
              <b>{Math.round(left)} kcal</b>
            </div>
          </div>

          <div className="progress"><div style={{ width: `${progress}%` }} /></div>

          <div className="macroList">
            <Macro label="Białko" value={totals.protein} unit="g" />
            <Macro label="Węgle" value={totals.carbs} unit="g" />
            <Macro label="Tłuszcze" value={totals.fat} unit="g" />
            <Macro label="Błonnik" value={totals.fiber} unit="g" />
          </div>
        </section>

        <section className="charts">
          <div className="chartCard">
            <h3>Makro</h3>
            <MacroChart protein={totals.protein} carbs={totals.carbs} fat={totals.fat} />
          </div>

          <div className="chartCard">
            <h3>7 dni</h3>
            <WeekChart data={weekData} goal={goal} />
          </div>
        </section>

        <section className="mealGrid">
          {MEALS.map((meal) => {
            const list = selectedMeals.filter((item) => item.mealType === meal.name);
            const kcal = list.reduce((sum, item) => sum + Number(item.kcal || 0), 0);

            return (
              <div className="mealCard" key={meal.name}>
                <div className="mealTop">
                  <h3>{meal.icon} {meal.name}</h3>
                  <b>{Math.round(kcal)} kcal</b>
                </div>

                {list.length === 0 ? (
                  <p className="emptyMeal">Dodaj pierwszy produkt</p>
                ) : (
                  list.map((item) => (
                    <div className="foodItem" key={item.id}>
                      {item.image && <img src={item.image} alt="" />}
                      <div>
                        <b>{item.name}</b>
                        <p>{item.description}</p>
                        <small>{Math.round(item.kcal)} kcal · B {Math.round(item.protein)}g · W {Math.round(item.carbs)}g · T {Math.round(item.fat)}g</small>
                        <button onClick={() => removeMeal(item.id)}>Usuń</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </section>
      </main>
    </>
  );
}

function Macro({ label, value, unit }) {
  return (
    <div className="macroItem">
      <span>{label}</span>
      <b>{Math.round(value)} {unit}</b>
    </div>
  );
}

function MacroChart({ protein, carbs, fat }) {
  const total = Number(protein || 0) + Number(carbs || 0) + Number(fat || 0);
  if (total <= 0) return <p className="emptyText">Dodaj posiłek, aby zobaczyć wykres.</p>;

  const p = (protein / total) * 360;
  const c = (carbs / total) * 360;

  return (
    <div className="donutWrap">
      <div
        className="donut"
        style={{ background: `conic-gradient(#0d4f35 0deg ${p}deg, #83a95c ${p}deg ${p + c}deg, #d6a24a ${p + c}deg 360deg)` }}
      >
        <div>{Math.round(total)}g</div>
      </div>
    </div>
  );
}

function WeekChart({ data, goal }) {
  return (
    <div className="weekChart">
      {data.map((item) => {
        const h = Math.max((item.kcal / Math.max(goal, 1)) * 100, item.kcal ? 12 : 4);
        return (
          <div className="barWrap" key={item.day}>
            <div className="barArea"><div className="bar" style={{ height: `${Math.min(h, 100)}%` }} /></div>
            <b>{item.label}</b>
            <span>{Math.round(item.kcal)}</span>
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
  background: #eef6ef;
  color: #123323;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
}

.page {
  width: 100%;
  max-width: 1040px;
  margin: 0 auto;
  padding: 12px;
}

.hero {
  min-height: 190px;
  border-radius: 28px;
  padding: 22px;
  color: white;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  background:
    linear-gradient(90deg, rgba(4,45,28,.92), rgba(10,92,57,.72)),
    url("https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80");
  background-size: cover;
  background-position: center;
  box-shadow: 0 18px 42px rgba(8,65,40,.23);
}

.eyebrow {
  font-size: 11px;
  letter-spacing: 2.4px;
  font-weight: 900;
  opacity: .82;
}

.hero h1 {
  font-size: 38px;
  line-height: 1;
  margin: 14px 0 8px;
}

.hero p {
  max-width: 640px;
  margin: 0;
  font-size: 16px;
  opacity: .93;
}

.heroScore {
  min-width: 112px;
  height: 112px;
  border-radius: 28px;
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.25);
  display: grid;
  place-items: center;
  text-align: center;
  align-self: center;
}

.heroScore span,
.heroScore small {
  font-size: 12px;
  opacity: .84;
}

.heroScore b {
  font-size: 34px;
  line-height: 1;
}

.addPanel,
.healthPanel,
.summaryPanel,
.chartCard,
.mealCard {
  background: rgba(255,255,255,.96);
  border-radius: 24px;
  border: 1px solid rgba(12,70,43,.08);
  box-shadow: 0 14px 34px rgba(15,85,54,.09);
  margin-top: 14px;
}

.addPanel,
.healthPanel,
.summaryPanel {
  padding: 18px;
}

.sectionTitle h2 {
  margin: 0;
  font-size: 28px;
}

.sectionTitle p {
  margin: 5px 0 0;
  color: #6d8373;
  font-size: 16px;
}

.sectionTitle.compact h2 {
  font-size: 24px;
}

.sectionTitle.compact p {
  font-size: 13px;
}

.modeSwitch,
.conditionTabs {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.modeSwitch {
  grid-template-columns: 1fr 1fr;
}

.conditionTabs {
  grid-template-columns: repeat(3, 1fr);
}

.modeSwitch button,
.conditionTabs button,
.aiBtn,
.saveBtn {
  border: none;
  border-radius: 16px;
  padding: 14px;
  font-weight: 900;
  cursor: pointer;
}

.modeSwitch button,
.conditionTabs button {
  background: #f6fbf7;
  border: 1px solid #dbeade;
  color: #123323;
}

.modeSwitch .active,
.conditionTabs .active {
  background: #0d4f35;
  color: white;
  border-color: #0d4f35;
}

.formGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
}

label span {
  display: block;
  color: #647d6b;
  font-weight: 900;
  margin-bottom: 6px;
}

select,
textarea,
.weightInput {
  width: 100%;
  border: 1px solid #dbeade;
  border-radius: 16px;
  background: white;
  padding: 13px;
  font-size: 16px;
  outline: none;
}

.weightInput {
  display: flex;
  gap: 8px;
  align-items: center;
}

.weightInput input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  font-weight: 900;
}

textarea {
  margin-top: 14px;
  min-height: 115px;
}

.uploadBox {
  margin-top: 14px;
  min-height: 210px;
  border: 2px dashed #95bda2;
  border-radius: 22px;
  background: #f6fbf7;
  display: grid;
  place-items: center;
  text-align: center;
  color: #24593b;
  overflow: hidden;
  cursor: pointer;
}

.uploadBox input { display: none; }

.uploadBox img {
  width: 100%;
  height: 260px;
  object-fit: cover;
}

.uploadInner div {
  font-size: 46px;
}

.uploadInner strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.uploadInner span {
  display: block;
  color: #6d8373;
  margin-top: 4px;
}

.aiBtn {
  width: 100%;
  margin-top: 14px;
  background: linear-gradient(135deg, #053823, #0d8055);
  color: white;
  font-size: 16px;
  box-shadow: 0 12px 26px rgba(5,56,35,.22);
}

.analysisCard {
  margin-top: 14px;
  background: #f6fbf7;
  border: 1px solid #dbeade;
  border-radius: 20px;
  padding: 16px;
}

.analysisCard h3 {
  margin: 6px 0;
}

.analysisCard p {
  color: #607a68;
}

.analysisStats {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.analysisStats b,
.analysisStats span {
  background: white;
  border-radius: 999px;
  padding: 9px 12px;
  font-weight: 900;
}

.saveBtn {
  width: 100%;
  margin-top: 12px;
  background: #0d4f35;
  color: white;
}

.opinion {
  margin-top: 12px;
  border-radius: 18px;
  padding: 15px;
  border: 1px solid #dbeade;
}

.opinion strong {
  display: block;
  font-size: 20px;
  margin-bottom: 6px;
}

.opinion p {
  margin: 0 0 8px;
  color: #344d3b;
  line-height: 1.35;
}

.opinion small {
  color: #5c7464;
  font-weight: 700;
}

.opinion.good { background: #edf8ef; border-color: #b6dec0; }
.opinion.mid { background: #fff8e8; border-color: #ead8a5; }
.opinion.warn { background: #fff0ed; border-color: #e5b2a7; }
.opinion.empty { background: #f6fbf7; }

.dateScroller {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.dateScroller button {
  flex: 0 0 auto;
  min-width: 96px;
  border: 1px solid #dbeade;
  background: #f6fbf7;
  color: #123323;
  border-radius: 16px;
  padding: 10px;
}

.dateScroller .selected {
  background: #0d4f35;
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
  margin-top: 3px;
}

.goalRow {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.goalRow span {
  color: #647d6b;
  font-weight: 900;
}

.goalInput {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
}

.goalInput input {
  width: 100px;
  border: 1px solid #dbeade;
  border-radius: 14px;
  padding: 11px;
  font-size: 17px;
  font-weight: 900;
}

.leftBox {
  background: #0d4f35;
  color: white;
  border-radius: 18px;
  padding: 13px 16px;
  text-align: center;
  min-width: 132px;
}

.leftBox span {
  color: rgba(255,255,255,.75);
  display: block;
  font-size: 12px;
}

.leftBox b {
  display: block;
  font-size: 21px;
  margin-top: 3px;
}

.progress {
  margin-top: 13px;
  height: 11px;
  background: #e1eee4;
  border-radius: 999px;
  overflow: hidden;
}

.progress div {
  height: 100%;
  background: linear-gradient(90deg, #0d4f35, #83b55b);
}

.macroList {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 12px;
}

.macroItem {
  background: #f6fbf7;
  border: 1px solid #dbeade;
  border-radius: 16px;
  padding: 10px;
}

.macroItem span {
  display: block;
  color: #647d6b;
  font-size: 12px;
  font-weight: 900;
}

.macroItem b {
  display: block;
  font-size: 18px;
  margin-top: 4px;
}

.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.chartCard {
  padding: 16px;
  min-height: 190px;
}

.chartCard h3 {
  margin: 0 0 10px;
  font-size: 22px;
}

.emptyText {
  color: #6d8373;
  font-size: 16px;
  line-height: 1.35;
}

.donutWrap {
  display: flex;
  justify-content: center;
}

.donut {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  position: relative;
}

.donut::after {
  content: "";
  position: absolute;
  width: 78px;
  height: 78px;
  background: white;
  border-radius: 50%;
}

.donut div {
  position: relative;
  z-index: 2;
  font-weight: 900;
  color: #0d4f35;
}

.weekChart {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 5px;
  align-items: end;
}

.barWrap {
  text-align: center;
}

.barArea {
  height: 100px;
  background: #eef6f0;
  border-radius: 999px;
  display: flex;
  align-items: end;
  overflow: hidden;
}

.bar {
  width: 100%;
  background: linear-gradient(180deg, #0d4f35, #83b55b);
  border-radius: 999px;
}

.barWrap b {
  display: block;
  font-size: 10px;
  margin-top: 4px;
}

.barWrap span {
  font-size: 10px;
  color: #6d8373;
}

.mealGrid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mealCard {
  padding: 15px;
}

.mealTop {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.mealTop h3 {
  margin: 0;
  font-size: 18px;
}

.mealTop b {
  color: #0d4f35;
}

.emptyMeal {
  margin: 12px 0 0;
  background: #f6fbf7;
  border-radius: 16px;
  padding: 13px;
  color: #6d8373;
  font-weight: 800;
}

.foodItem {
  display: flex;
  gap: 12px;
  border-top: 1px solid #e4efe7;
  padding-top: 12px;
  margin-top: 12px;
}

.foodItem img {
  width: 68px;
  height: 68px;
  border-radius: 16px;
  object-fit: cover;
}

.foodItem p {
  margin: 4px 0;
  color: #607a68;
}

.foodItem small {
  color: #607a68;
}

.foodItem button {
  margin-top: 8px;
  border: none;
  background: #ffe1dc;
  color: #9b2d20;
  border-radius: 12px;
  padding: 8px 12px;
  font-weight: 900;
}

@media (max-width: 760px) {
  .page {
    padding: 10px;
  }

  .hero {
    min-height: 160px;
    border-radius: 24px;
    padding: 18px;
  }

  .hero h1 {
    font-size: 30px;
  }

  .hero p {
    font-size: 14px;
  }

  .heroScore {
    min-width: 88px;
    height: 88px;
    border-radius: 22px;
  }

  .heroScore b {
    font-size: 28px;
  }

  .addPanel,
  .healthPanel,
  .summaryPanel {
    padding: 15px;
  }

  .sectionTitle h2 {
    font-size: 26px;
  }

  .formGrid {
    grid-template-columns: 1fr;
  }

  .macroList {
    grid-template-columns: repeat(2, 1fr);
  }

  .charts {
    grid-template-columns: 1fr;
  }

  .goalRow {
    align-items: center;
  }

  .conditionTabs {
    grid-template-columns: 1fr;
  }

  .hero {
    display: block;
  }

  .heroScore {
    margin-top: 14px;
    width: 100%;
  }
}
`;