import React, { useEffect, useMemo, useState } from "react";

const MEALS = ["Śniadanie", "Drugie śniadanie", "Obiad", "Podwieczorek", "Kolacja"];

export default function App() {
  const [mode, setMode] = useState("photo");
  const [mealType, setMealType] = useState("Śniadanie");
  const [gramsText, setGramsText] = useState("");
  const [manualText, setManualText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState([]);
  const [dailyGoal, setDailyGoal] = useState(2000);

  useEffect(() => {
    const saved = localStorage.getItem("kalorieAiProMeals");
    if (saved) setMeals(JSON.parse(saved));

    const savedGoal = localStorage.getItem("kalorieAiGoal");
    if (savedGoal) setDailyGoal(Number(savedGoal));
  }, []);

  useEffect(() => {
    localStorage.setItem("kalorieAiProMeals", JSON.stringify(meals));
  }, [meals]);

  useEffect(() => {
    localStorage.setItem("kalorieAiGoal", String(dailyGoal));
  }, [dailyGoal]);

  const today = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date === today);

  const totals = useMemo(() => {
    return todayMeals.reduce(
      (sum, item) => ({
        kcal: sum.kcal + Number(item.kcal || 0),
        protein: sum.protein + Number(item.protein || 0),
        fat: sum.fat + Number(item.fat || 0),
        carbs: sum.carbs + Number(item.carbs || 0),
        fiber: sum.fiber + Number(item.fiber || 0),
        sugar: sum.sugar + Number(item.sugar || 0),
      }),
      { kcal: 0, protein: 0, fat: 0, carbs: 0, fiber: 0, sugar: 0 }
    );
  }, [todayMeals]);

  const remaining = Math.max(dailyGoal - totals.kcal, 0);
  const progress = Math.min((totals.kcal / dailyGoal) * 100, 100);

  function handleImage(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function toBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function analyzeMeal() {
    if (mode === "photo" && !imageFile) {
      alert("Dodaj zdjęcie potrawy.");
      return;
    }

    if (mode === "manual" && !manualText.trim()) {
      alert("Wpisz produkty, np. 2 ziemniaki, 150 g kurczaka.");
      return;
    }

    setLoading(true);

    try {
      const image = imageFile ? await toBase64(imageFile) : null;

      const res = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          image,
          manualText,
          gramsText,
          mealType,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Błąd: " + (data.error || "Nie udało się policzyć kalorii"));
        setLoading(false);
        return;
      }

      const newMeal = {
        id: Date.now(),
        date: today,
        mealType,
        image: preview || "",
        name: data.name || "Posiłek",
        description: data.description || "",
        kcal: Number(data.kcal || 0),
        protein: Number(data.protein || 0),
        fat: Number(data.fat || 0),
        carbs: Number(data.carbs || 0),
        fiber: Number(data.fiber || 0),
        sugar: Number(data.sugar || 0),
        range: data.range || "",
        note: data.note || "Wynik szacunkowy",
        ingredients: data.ingredients || [],
      };

      setMeals((prev) => [newMeal, ...prev]);
      setManualText("");
      setGramsText("");
      setImageFile(null);
      setPreview("");
    } catch (err) {
      alert("Błąd: " + err.message);
    }

    setLoading(false);
  }

  function deleteMeal(id) {
    setMeals((prev) => prev.filter((m) => m.id !== id));
  }

  function clearToday() {
    if (!window.confirm("Usunąć wszystkie dzisiejsze posiłki?")) return;
    setMeals((prev) => prev.filter((m) => m.date !== today));
  }

  return (
    <div style={styles.page}>
      <div style={styles.app}>
        <header style={styles.hero}>
          <div>
            <div style={styles.badge}>AI FOOD TRACKER</div>
            <h1 style={styles.title}>Kalorie AI Diana PRO</h1>
            <p style={styles.subtitle}>
              Dodaj zdjęcie potrawy albo wpisz produkty ręcznie. Aplikacja policzy kalorie,
              wagę porcji i makroskładniki.
            </p>
          </div>
          <div style={styles.heroIcon}>🥕🍎</div>
        </header>

        <section style={styles.summary}>
          <div style={styles.goalRow}>
            <div>
              <span style={styles.label}>Dzisiejszy cel</span>
              <div>
                <input
                  style={styles.goalInput}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value || 0))}
                />
                <b> kcal</b>
              </div>
            </div>

            <div style={styles.kcalBox}>
              <span>Dzisiaj</span>
              <b>{Math.round(totals.kcal)} kcal</b>
            </div>
          </div>

          <div style={styles.progressOuter}>
            <div style={{ ...styles.progressInner, width: `${progress}%` }} />
          </div>

          <div style={styles.leftText}>Zostało: {Math.round(remaining)} kcal</div>

          <div style={styles.macroGrid}>
            <Macro label="Białko" value={totals.protein} unit="g" />
            <Macro label="Węgle" value={totals.carbs} unit="g" />
            <Macro label="Tłuszcze" value={totals.fat} unit="g" />
            <Macro label="Błonnik" value={totals.fiber} unit="g" />
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Dodaj posiłek</h2>

          <div style={styles.tabs}>
            <button
              style={mode === "photo" ? styles.activeTab : styles.tab}
              onClick={() => setMode("photo")}
            >
              🥕🍎 Zdjęcie potrawy
            </button>
            <button
              style={mode === "manual" ? styles.activeTab : styles.tab}
              onClick={() => setMode("manual")}
            >
              ✍️ Policz ręcznie
            </button>
          </div>

          <select style={styles.input} value={mealType} onChange={(e) => setMealType(e.target.value)}>
            {MEALS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <div style={styles.weightBox}>
            <label style={styles.weightLabel}>Waga porcji</label>
            <div style={styles.weightRow}>
              <input
                type="number"
                style={styles.weightInput}
                placeholder="np. 150"
                value={gramsText}
                onChange={(e) => setGramsText(e.target.value)}
              />
              <span style={styles.weightUnit}>g</span>
            </div>
          </div>

          {mode === "manual" ? (
            <textarea
              style={styles.textarea}
              placeholder="Wpisz produkty, np. 2 ziemniaki, 150 g kurczaka, 3 marchewki, łyżka oliwy"
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
            />
          ) : (
            <label style={styles.dropzone}>
              {preview ? (
                <img src={preview} alt="Podgląd" style={styles.preview} />
              ) : (
                <>
                  <div style={styles.camera}>🥕🍎</div>
                  <b>Dodaj zdjęcie potrawy</b>
                  <span>AI rozpozna jedzenie i obliczy kalorie</span>
                </>
              )}
              <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
            </label>
          )}

          <button style={styles.mainButton} onClick={analyzeMeal} disabled={loading}>
            {loading ? "Liczenie kalorii..." : "Rozpoznaj i dodaj do dziennika"}
          </button>
        </section>

        <section style={styles.mealsGrid}>
          {MEALS.map((meal) => {
            const list = todayMeals.filter((m) => m.mealType === meal);
            const kcal = list.reduce((s, x) => s + Number(x.kcal || 0), 0);

            return (
              <div key={meal} style={styles.mealCard}>
                <div style={styles.mealHeader}>
                  <h3>{meal}</h3>
                  <b>{Math.round(kcal)} kcal</b>
                </div>

                {list.length === 0 ? (
                  <p style={styles.empty}>Brak produktów</p>
                ) : (
                  list.map((item) => (
                    <div key={item.id} style={styles.foodItem}>
                      {item.image && <img src={item.image} alt="" style={styles.thumb} />}
                      <div style={{ flex: 1 }}>
                        <b>{item.name}</b>
                        <p>{item.description}</p>
                        <small>
                          {Math.round(item.kcal)} kcal · B {Math.round(item.protein)}g · W{" "}
                          {Math.round(item.carbs)}g · T {Math.round(item.fat)}g
                        </small>

                        {item.ingredients?.length > 0 && (
                          <details style={styles.details}>
                            <summary>Składniki</summary>
                            {item.ingredients.map((ing, i) => (
                              <div key={i} style={styles.ingredient}>
                                {ing.name} — {ing.amount} — {ing.kcal} kcal
                              </div>
                            ))}
                          </details>
                        )}
                      </div>

                      <button style={styles.deleteButton} onClick={() => deleteMeal(item.id)}>
                        Usuń
                      </button>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </section>

        <button style={styles.clearButton} onClick={clearToday}>
          Wyczyść dzisiejszy dzień
        </button>
      </div>
    </div>
  );
}

function Macro({ label, value, unit }) {
  return (
    <div style={styles.macro}>
      <span>{label}</span>
      <b>
        {Math.round(value)} {unit}
      </b>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, #dff5df 0, #eef8ec 35%, #c9e8c9 100%)",
    padding: 18,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
    color: "#173b25",
  },
  app: {
    maxWidth: 980,
    margin: "0 auto",
  },
  hero: {
    background: "linear-gradient(135deg, #063f2a, #0f6b43)",
    color: "white",
    borderRadius: 32,
    padding: 32,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 22px 50px rgba(6,63,42,.25)",
  },
  badge: {
    fontSize: 12,
    letterSpacing: 2,
    opacity: 0.85,
    fontWeight: 800,
  },
  title: {
    margin: "12px 0 8px",
    fontSize: 42,
    lineHeight: 1.05,
  },
  subtitle: {
    margin: 0,
    fontSize: 17,
    opacity: 0.92,
    maxWidth: 620,
  },
  heroIcon: {
    fontSize: 72,
  },
  summary: {
    marginTop: 18,
    background: "rgba(255,255,255,.86)",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 40px rgba(15,107,67,.12)",
  },
  goalRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  label: {
    display: "block",
    color: "#5b7d66",
    marginBottom: 6,
    fontWeight: 700,
  },
  goalInput: {
    width: 110,
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid #bdd9c1",
    fontSize: 18,
    fontWeight: 700,
    color: "#173b25",
    outline: "none",
  },
  kcalBox: {
    background: "#063f2a",
    color: "white",
    padding: "16px 22px",
    borderRadius: 22,
    minWidth: 150,
    textAlign: "center",
  },
  progressOuter: {
    height: 14,
    background: "#dcefe0",
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 20,
  },
  progressInner: {
    height: "100%",
    background: "linear-gradient(90deg, #2e7d32, #72bf44)",
    borderRadius: 999,
  },
  leftText: {
    textAlign: "right",
    marginTop: 8,
    color: "#315c3f",
    fontWeight: 700,
  },
  macroGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
    marginTop: 18,
  },
  macro: {
    background: "#eef8ec",
    border: "1px solid #cfe6d1",
    borderRadius: 20,
    padding: 16,
    textAlign: "center",
  },
  card: {
    marginTop: 18,
    background: "rgba(255,255,255,.9)",
    borderRadius: 28,
    padding: 24,
    boxShadow: "0 18px 40px rgba(15,107,67,.12)",
  },
  sectionTitle: {
    marginTop: 0,
    fontSize: 30,
  },
  tabs: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
    marginBottom: 14,
  },
  tab: {
    padding: 15,
    borderRadius: 18,
    border: "1px solid #cfe6d1",
    background: "#f8fff7",
    color: "#173b25",
    fontWeight: 800,
    cursor: "pointer",
  },
  activeTab: {
    padding: 15,
    borderRadius: 18,
    border: "none",
    background: "linear-gradient(135deg, #06442d, #117548)",
    color: "white",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(6,68,45,.22)",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "15px 18px",
    borderRadius: 18,
    border: "1px solid #cfe6d1",
    marginTop: 10,
    fontSize: 16,
    outline: "none",
    background: "white",
    color: "#173b25",
  },
  weightBox: {
    marginTop: 12,
    background: "#f3fbf2",
    border: "1px solid #cfe6d1",
    borderRadius: 22,
    padding: 16,
  },
  weightLabel: {
    display: "block",
    fontWeight: 800,
    marginBottom: 8,
    color: "#315c3f",
  },
  weightRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  weightInput: {
    flex: 1,
    padding: "15px 18px",
    borderRadius: 18,
    border: "1px solid #cfe6d1",
    fontSize: 18,
    fontWeight: 800,
    outline: "none",
  },
  weightUnit: {
    fontSize: 20,
    fontWeight: 900,
    color: "#173b25",
  },
  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: 18,
    minHeight: 120,
    borderRadius: 20,
    border: "1px solid #cfe6d1",
    marginTop: 10,
    fontSize: 16,
    outline: "none",
    resize: "vertical",
  },
  dropzone: {
    marginTop: 14,
    border: "2px dashed #76b982",
    background: "#f3fbf2",
    borderRadius: 26,
    minHeight: 260,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    cursor: "pointer",
    color: "#2e7d32",
    textAlign: "center",
    overflow: "hidden",
  },
  camera: {
    fontSize: 54,
  },
  preview: {
    width: "100%",
    height: 300,
    objectFit: "cover",
  },
  mainButton: {
    width: "100%",
    marginTop: 16,
    padding: 18,
    borderRadius: 20,
    border: "none",
    background: "linear-gradient(135deg, #063f2a, #0f6b43)",
    color: "white",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(6,63,42,.22)",
  },
  mealsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 16,
    marginTop: 18,
  },
  mealCard: {
    background: "rgba(255,255,255,.9)",
    borderRadius: 26,
    padding: 20,
    boxShadow: "0 14px 35px rgba(15,107,67,.10)",
    minHeight: 150,
  },
  mealHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  empty: {
    color: "#78927d",
  },
  foodItem: {
    display: "flex",
    gap: 12,
    marginTop: 12,
    paddingTop: 12,
    borderTop: "1px solid #e1eee3",
    alignItems: "flex-start",
  },
  thumb: {
    width: 64,
    height: 64,
    objectFit: "cover",
    borderRadius: 16,
  },
  details: {
    marginTop: 8,
    color: "#315c3f",
  },
  ingredient: {
    fontSize: 13,
    marginTop: 4,
  },
  deleteButton: {
    border: "none",
    background: "#ffe1df",
    color: "#a13224",
    padding: "8px 10px",
    borderRadius: 12,
    cursor: "pointer",
  },
  clearButton: {
    marginTop: 18,
    width: "100%",
    padding: 15,
    border: "none",
    borderRadius: 18,
    background: "#dcefe0",
    color: "#173b25",
    fontWeight: 900,
    cursor: "pointer",
  },
};