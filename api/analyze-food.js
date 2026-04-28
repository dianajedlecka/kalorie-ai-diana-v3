export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metoda niedozwolona' });
  }

  try {
    const body = req.body || {};

    const image = body.image;
    const mode = body.mode || 'manual';
    const manualText = body.manualText || '';
    const gramsText = body.gramsText || '';
    const portion = body.portion || 'średnia porcja';
    const mealType = body.mealType || 'posiłek';

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'Brak klucza OPENAI_API_KEY w Vercel',
      });
    }

    if (mode === 'photo' && !image) {
      return res.status(400).json({
        error: 'Dodaj zdjęcie potrawy',
      });
    }

    if (mode === 'manual' && manualText.trim() === '') {
      return res.status(400).json({
        error: 'Wpisz produkty do policzenia',
      });
    }

    const prompt =
      'Jesteś asystentem dietetycznym AI. ' +
      'Policz kalorie oraz makroskładniki posiłku. ' +
      'Uwzględnij gramaturę, sztuki i wielkość porcji. ' +
      'Jeśli użytkownik podał np. 2 ziemniaki albo 3 marchewki, oszacuj typową wagę. ' +
      'Wynik podaj po polsku. ' +
      'Zwróć WYŁĄCZNIE poprawny JSON bez żadnego dodatkowego tekstu. ' +
      'Tryb: ' +
      mode +
      '. ' +
      'Rodzaj posiłku: ' +
      mealType +
      '. ' +
      'Porcja: ' +
      portion +
      '. ' +
      'Gramatura lub ilość: ' +
      gramsText +
      '. ' +
      'Produkty wpisane ręcznie: ' +
      manualText +
      '. ' +
      'Format JSON: ' +
      JSON.stringify({
        name: 'nazwa posiłku',
        mealType: 'śniadanie / obiad / podwieczorek / kolacja',
        description: 'krótki opis',
        kcal: 500,
        protein: 30,
        fat: 15,
        carbs: 55,
        fiber: 6,
        sugar: 8,
        range: '450-600 kcal',
        note: 'wynik szacunkowy',
        ingredients: [
          {
            name: 'produkt',
            amount: 'np. 2 sztuki / 150 g',
            estimated_grams: 150,
            kcal: 120,
            protein: 3,
            fat: 0,
            carbs: 26,
            fiber: 3,
            sugar: 2,
          },
        ],
      });

    let content;

    if (mode === 'photo') {
      content = [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: image,
          },
        },
      ];
    } else {
      content = [
        {
          type: 'text',
          text: prompt,
        },
      ];
    }

    const openAiResponse = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + process.env.OPENAI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: content,
            },
          ],
          response_format: {
            type: 'json_object',
          },
        }),
      }
    );

    const data = await openAiResponse.json();

    if (!openAiResponse.ok) {
      return res.status(500).json({
        error: 'Błąd OpenAI',
        details: data,
      });
    }

    const answer =
      data.choices &&
      data.choices[0] &&
      data.choices[0].message &&
      data.choices[0].message.content;

    if (!answer) {
      return res.status(500).json({
        error: 'Brak odpowiedzi AI',
        details: data,
      });
    }

    const parsed = JSON.parse(answer);

    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({
      error: 'Błąd analizy',
      details: error.message,
    });
  }
}
