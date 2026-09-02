import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { studentInfo, emailContent } = req.body;
  if (!studentInfo || !emailContent) {
    return res.status(400).json({ error: '학번이름과 이메일 내용을 입력해 주세요.' });
  }

  const systemPrompt = `
You are an English writing feedback teacher for Korean middle school students at CEFR A1-B1.
Analyze the student's email according to 3 criteria:
1. Register & Appropriate language
2. Coherence & Cohesion (Event -> Activity -> Expected Effect)
3. Required conditions: to-infinitive and conjunction for expected effect.

Return strictly JSON matching this structure:
{
  "summary": {
    "register": "pass",
    "coherence": "pass",
    "cohesion": "pass",
    "to_infinitive": true,
    "conjunction_effect": false
  },
  "ai_revision_example": "Full revised email example here..."
}`;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-pro",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent([
      systemPrompt,
      `Student E-mail:\n${emailContent}`
    ]);

    const feedbackData = JSON.parse(result.response.text());
    return res.status(200).json(feedbackData);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'AI 분석 실패' });
  }
}
