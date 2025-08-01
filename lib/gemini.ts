import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface DocumentAnalysisResult {
  summary: string
  keyPoints: string[]
  sentiment?: "positive" | "negative" | "neutral"
  entities?: Array<{
    text: string
    type: string
    confidence: number
  }>
  financialData?: Array<{
    metric: string
    value: string
    context: string
  }>
  riskFactors?: string[]
  recommendations?: string[]
  confidenceScore: number
}

export interface AnalysisResult {
  type: string
  results: any
  confidence_score?: number
  processing_time?: number
}

export async function analyzeDocument(
  content: string,
  analysisType: string,
  filename: string,
  language = "pl",
): Promise<AnalysisResult> {
  const startTime = Date.now()

  const prompts = {
    pl: {
      "content-analysis": `Przeanalizuj następującą treść dokumentu i podaj:
1. Kompleksowe podsumowanie
2. Kluczowe punkty i główne tematy
3. Ważne wymienione jednostki
4. Ocenę ogólnej struktury

Dokument: ${filename}
Treść: ${content}`,

      "financial-review": `Przeanalizuj ten dokument finansowy i wyodrębnij:
1. Kluczowe wskaźniki finansowe i liczby
2. Trendy i wzorce
3. Czynniki ryzyka
4. Wskaźniki kondycji finansowej
5. Rekomendacje

Dokument: ${filename}
Treść: ${content}`,

      "legal-compliance": `Przejrzyj ten dokument prawny pod kątem:
1. Kwestii zgodności
2. Czynników ryzyka
3. Kluczowych terminów prawnych i klauzul
4. Rekomendacji dotyczących ulepszeń
5. Potencjalnych problemów

Dokument: ${filename}
Treść: ${content}`,

      "sentiment-analysis": `Przeanalizuj sentyment i ton tego dokumentu:
1. Ogólny sentyment (pozytywny/negatywny/neutralny)
2. Wskaźniki emocjonalne
3. Analiza tonu
4. Kluczowe frazy wskazujące na sentyment
5. Pewność oceny sentymentu

Dokument: ${filename}
Treść: ${content}`,

      "data-extraction": `Wyodrębnij ustrukturyzowane dane z tego dokumentu:
1. Kluczowe punkty danych i wartości
2. Daty, liczby i pomiary
3. Nazwy, lokalizacje i jednostki
4. Informacje strukturalne
5. Ocena jakości danych

Dokument: ${filename}
Treść: ${content}`,

      "custom-analysis": `Przeprowadź kompleksową analizę tego dokumentu:
1. Typ i cel dokumentu
2. Kluczowe informacje i spostrzeżenia
3. Struktura i organizacja
4. Ważne ustalenia
5. Rekomendacje do działania

Dokument: ${filename}
Treść: ${content}`,
      sentiment: `Przeanalizuj sentyment tego tekstu w języku polskim. Zwróć odpowiedź w formacie JSON z polami: sentiment (pozytywny/negatywny/neutralny), confidence (0-1), reasoning (wyjaśnienie po polsku). Tekst: ${content}`,
      entities: `Wyodrębnij kluczowe jednostki z tego tekstu w języku polskim. Zwróć odpowiedź w formacie JSON z polami: persons (osoby), organizations (organizacje), locations (miejsca), dates (daty), other (inne). Tekst: ${content}`,
      summary: `Stwórz zwięzłe streszczenie tego tekstu w języku polskim. Zwróć odpowiedź w formacie JSON z polami: summary (streszczenie), key_points (kluczowe punkty jako tablica), word_count (liczba słów). Tekst: ${content}`,
      classification: `Sklasyfikuj ten tekst w języku polskim. Zwróć odpowiedź w formacie JSON z polami: category (kategoria), subcategory (podkategoria), confidence (pewność 0-1), tags (tagi jako tablica). Tekst: ${content}`,
      translation: `Przetłumacz ten tekst na język angielski. Zwróć odpowiedź w formacie JSON z polami: original_language (język źródłowy), translated_text (przetłumaczony tekst), confidence (pewność 0-1). Tekst: ${content}`,
      keywords: `Wyodrębnij kluczowe słowa z tego tekstu w języku polskim. Zwróć odpowiedź w formacie JSON z polami: keywords (słowa kluczowe jako tablica), phrases (frazy kluczowe jako tablica), importance_scores (wyniki ważności dla każdego słowa). Tekst: ${content}`,
    },
    en: {
      "content-analysis": `Analyze the following document content and provide:
1. A comprehensive summary
2. Key points and main topics
3. Important entities mentioned
4. Overall structure assessment

Document: ${filename}
Content: ${content}`,

      "financial-review": `Analyze this financial document and extract:
1. Key financial metrics and numbers
2. Trends and patterns
3. Risk factors
4. Financial health indicators
5. Recommendations

Document: ${filename}
Content: ${content}`,

      "legal-compliance": `Review this legal document for:
1. Compliance issues
2. Risk factors
3. Key legal terms and clauses
4. Recommendations for improvement
5. Potential concerns

Document: ${filename}
Content: ${content}`,

      "sentiment-analysis": `Analyze the sentiment and tone of this document:
1. Overall sentiment (positive/negative/neutral)
2. Emotional indicators
3. Tone analysis
4. Key phrases that indicate sentiment
5. Confidence in sentiment assessment

Document: ${filename}
Content: ${content}`,

      "data-extraction": `Extract structured data from this document:
1. Key data points and values
2. Dates, numbers, and measurements
3. Names, locations, and entities
4. Structured information
5. Data quality assessment

Document: ${filename}
Content: ${content}`,

      "custom-analysis": `Provide a comprehensive analysis of this document:
1. Document type and purpose
2. Key information and insights
3. Structure and organization
4. Important findings
5. Actionable recommendations

Document: ${filename}
Content: ${content}`,
      sentiment: `Analyze the sentiment of this text in English. Return response in JSON format with fields: sentiment (positive/negative/neutral), confidence (0-1), reasoning (explanation in English). Text: ${content}`,
      entities: `Extract key entities from this text in English. Return response in JSON format with fields: persons, organizations, locations, dates, other. Text: ${content}`,
      summary: `Create a concise summary of this text in English. Return response in JSON format with fields: summary, key_points (as array), word_count. Text: ${content}`,
      classification: `Classify this text in English. Return response in JSON format with fields: category, subcategory, confidence (0-1), tags (as array). Text: ${content}`,
      translation: `Translate this text to Polish. Return response in JSON format with fields: original_language, translated_text, confidence (0-1). Text: ${content}`,
      keywords: `Extract keywords from this text in English. Return response in JSON format with fields: keywords (as array), phrases (as array), importance_scores. Text: ${content}`,
    },
    de: {
      "content-analysis": `Analysieren Sie den folgenden Dokumentinhalt und geben Sie an:
1. Eine umfassende Zusammenfassung
2. Wichtige Punkte und Hauptthemen
3. Wichtige erwähnte Entitäten
4. Bewertung der Gesamtstruktur

Dokument: ${filename}
Inhalt: ${content}`,

      "financial-review": `Analysieren Sie dieses Finanzdokument und extrahieren Sie:
1. Wichtige Finanzkennzahlen und Zahlen
2. Trends und Muster
3. Risikofaktoren
4. Indikatoren für die finanzielle Gesundheit
5. Empfehlungen

Dokument: ${filename}
Inhalt: ${content}`,

      "legal-compliance": `Überprüfen Sie dieses Rechtsdokument auf:
1. Compliance-Probleme
2. Risikofaktoren
3. Wichtige Rechtsbegriffe und Klauseln
4. Verbesserungsempfehlungen
5. Potenzielle Bedenken

Dokument: ${filename}
Inhalt: ${content}`,

      "sentiment-analysis": `Analysieren Sie die Stimmung und den Ton dieses Dokuments:
1. Gesamtstimmung (positiv/negativ/neutral)
2. Emotionale Indikatoren
3. Tonanalyse
4. Schlüsselphrasen, die auf Stimmung hinweisen
5. Vertrauen in die Stimmungsbewertung

Dokument: ${filename}
Inhalt: ${content}`,

      "data-extraction": `Extrahieren Sie strukturierte Daten aus diesem Dokument:
1. Wichtige Datenpunkte und Werte
2. Daten, Zahlen und Messungen
3. Namen, Standorte und Entitäten
4. Strukturelle Informationen
5. Datenqualitätsbewertung

Dokument: ${filename}
Inhalt: ${content}`,

      "custom-analysis": `Führen Sie eine umfassende Analyse dieses Dokuments durch:
1. Dokumenttyp und Zweck
2. Wichtige Informationen und Erkenntnisse
3. Struktur und Organisation
4. Wichtige Erkenntnisse
5. Umsetzbare Empfehlungen

Dokument: ${filename}
Inhalt: ${content}`,
      sentiment: `Analysieren Sie die Stimmung dieses Textes auf Deutsch. Antworten Sie im JSON-Format mit Feldern: sentiment (positiv/negativ/neutral), confidence (0-1), reasoning (Erklärung auf Deutsch). Text: ${content}`,
      entities: `Extrahieren Sie Schlüsselentitäten aus diesem Text auf Deutsch. Antworten Sie im JSON-Format mit Feldern: persons, organizations, locations, dates, other. Text: ${content}`,
      summary: `Erstellen Sie eine prägnante Zusammenfassung dieses Textes auf Deutsch. Antworten Sie im JSON-Format mit Feldern: summary, key_points (als Array), word_count. Text: ${content}`,
      classification: `Klassifizieren Sie diesen Text auf Deutsch. Antworten Sie im JSON-Format mit Feldern: category, subcategory, confidence (0-1), tags (als Array). Text: ${content}`,
      translation: `Übersetzen Sie diesen Text ins Englische. Antworten Sie im JSON-Format mit Feldern: original_language, translated_text, confidence (0-1). Text: ${content}`,
      keywords: `Extrahieren Sie Schlüsselwörter aus diesem Text auf Deutsch. Antworten Sie im JSON-Format mit Feldern: keywords (als Array), phrases (als Array), importance_scores. Text: ${content}`,
    },
    uk: {
      "content-analysis": `Проаналізуйте наступний зміст документа та надайте:
1. Всебічне резюме
2. Ключові моменти та основні теми
3. Важливі згадані сутності
4. Оцінка загальної структури

Документ: ${filename}
Зміст: ${content}`,

      "financial-review": `Проаналізуйте цей фінансовий документ та витягніть:
1. Ключові фінансові показники та цифри
2. Тенденції та закономірності
3. Фактори ризику
4. Показники фінансового здоров'я
5. Рекомендації

Документ: ${filename}
Зміст: ${content}`,

      "legal-compliance": `Перегляньте цей правовий документ на предмет:
1. Питання відповідності
2. Фактори ризику
3. Ключові правові терміни та положення
4. Рекомендації щодо покращення
5. Потенційні проблеми

Документ: ${filename}
Зміст: ${content}`,

      "sentiment-analysis": `Проаналізуйте настрій та тон цього документа:
1. Загальний настрій (позитивний/негативний/нейтральний)
2. Емоційні індикатори
3. Аналіз тону
4. Ключові фрази, що вказують на настрій
5. Впевненість в оцінці настрою

Документ: ${filename}
Зміст: ${content}`,

      "data-extraction": `Витягніть структуровані дані з цього документа:
1. Ключові точки даних та значення
2. Дати, числа та вимірювання
3. Імена, місця та сутності
4. Структурна інформація
5. Оцінка якості даних

Документ: ${filename}
Зміст: ${content}`,

      "custom-analysis": `Проведіть всебічний аналіз цього документа:
1. Тип та призначення документа
2. Ключова інформація та висновки
3. Структура та організація
4. Важливі знахідки
5. Практичні рекомендації

Документ: ${filename}
Зміст: ${content}`,
      sentiment: `Проаналізуйте настрій цього тексту українською мовою. Поверніть відповідь у форматі JSON з полями: sentiment (позитивний/негативний/нейтральний), confidence (0-1), reasoning (пояснення українською). Текст: ${content}`,
      entities: `Витягніть ключові сутності з цього тексту українською мовою. Поверніть відповідь у форматі JSON з полями: persons, organizations, locations, dates, other. Текст: ${content}`,
      summary: `Створіть стислий виклад цього тексту українською мовою. Поверніть відповідь у форматі JSON з полями: summary, key_points (як масив), word_count. Текст: ${content}`,
      classification: `Класифікуйте цей текст українською мовою. Поверніть відповідь у форматі JSON з полями: category, subcategory, confidence (0-1), tags (як масив). Текст: ${content}`,
      translation: `Перекладіть цей текст англійською мовою. Поверніть відповідь у форматі JSON з полями: original_language, translated_text, confidence (0-1). Текст: ${content}`,
      keywords: `Витягніть ключові слова з цього тексту українською мовою. Поверніть відповідь у форматі JSON з полями: keywords (як масив), phrases (як масив), importance_scores. Текст: ${content}`,
    },
    es: {
      "content-analysis": `Analiza el siguiente contenido del documento y proporciona:
1. Un resumen completo
2. Puntos clave y temas principales
3. Entidades importantes mencionadas
4. Evaluación de la estructura general

Documento: ${filename}
Contenido: ${content}`,

      "financial-review": `Analiza este documento financiero y extrae:
1. Métricas financieras clave y números
2. Tendencias y patrones
3. Factores de riesgo
4. Indicadores de salud financiera
5. Recomendaciones

Documento: ${filename}
Contenido: ${content}`,

      "legal-compliance": `Revisa este documento legal para:
1. Problemas de cumplimiento
2. Factores de riesgo
3. Términos legales clave y cláusulas
4. Recomendaciones de mejora
5. Preocupaciones potenciales

Documento: ${filename}
Contenido: ${content}`,

      "sentiment-analysis": `Analiza el sentimiento y tono de este documento:
1. Sentimiento general (positivo/negativo/neutral)
2. Indicadores emocionales
3. Análisis de tono
4. Frases clave que indican sentimiento
5. Confianza en la evaluación del sentimiento

Documento: ${filename}
Contenido: ${content}`,

      "data-extraction": `Extrae datos estructurados de este documento:
1. Puntos de datos clave y valores
2. Fechas, números y mediciones
3. Nombres, ubicaciones y entidades
4. Información estructural
5. Evaluación de calidad de datos

Documento: ${filename}
Contenido: ${content}`,

      "custom-analysis": `Proporciona un análisis completo de este documento:
1. Tipo y propósito del documento
2. Información clave e insights
3. Estructura y organización
4. Hallazgos importantes
5. Recomendaciones accionables

Documento: ${filename}
Contenido: ${content}`,
      sentiment: `Analiza el sentimiento de este texto en español. Devuelve la respuesta en formato JSON con campos: sentiment (positivo/negativo/neutral), confidence (0-1), reasoning (explicación en español). Texto: ${content}`,
      entities: `Extrae entidades clave de este texto en español. Devuelve la respuesta en formato JSON con campos: persons, organizations, locations, dates, other. Texto: ${content}`,
      summary: `Crea un resumen conciso de este texto en español. Devuelve la respuesta en formato JSON con campos: summary, key_points (como array), word_count. Texto: ${content}`,
      classification: `Clasifica este texto en español. Devuelve la respuesta en formato JSON con campos: category, subcategory, confidence (0-1), tags (como array). Texto: ${content}`,
      translation: `Traduce este texto al inglés. Devuelve la respuesta en formato JSON con campos: original_language, translated_text, confidence (0-1). Texto: ${content}`,
      keywords: `Extrae palabras clave de este texto en español. Devuelve la respuesta en formato JSON con campos: keywords (como array), phrases (como array), importance_scores. Texto: ${content}`,
    },
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt =
      prompts[language as keyof typeof prompts]?.[analysisType as keyof typeof prompts.pl] ||
      prompts.pl[analysisType as keyof typeof prompts.pl]

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let parsedResults
    try {
      parsedResults = JSON.parse(text)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      parsedResults = {
        raw_response: text,
        analysis_type: analysisType,
        language: language,
      }
    }

    const processingTime = Date.now() - startTime

    return {
      type: analysisType,
      results: parsedResults,
      confidence_score: parsedResults.confidence || 0.8,
      processing_time: processingTime,
    }
  } catch (error) {
    console.error("Gemini analysis error:", error)
    throw new Error("Failed to analyze document with Gemini")
  }
}
