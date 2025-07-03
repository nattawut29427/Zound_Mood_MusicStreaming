import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function generatePlaylist(prompt: string, songs: any[]) {
  const fullPrompt = `
คุณคือนักจัด Playlist อัจฉริยะ

คำขอของผู้ใช้: "${prompt}"

ข้อมูลเพลง:
${JSON.stringify(songs, null, 2)}

โปรดตอบกลับเฉพาะ JSON ในรูปแบบนี้อย่างเดียว:
{
  "playlist": [/* รหัสเพลงที่เลือก (string array) */],
  "reason": "คำอธิบายเหตุผลการเลือกเพลงอย่างละเอียด"
}

ห้ามตอบข้อความอื่น ๆ นอกจาก JSON นี้
`;

  const res = await groq.chat.completions.create({
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: "คุณคือผู้ช่วยแนะนำเพลง" },
      { role: "user", content: fullPrompt },
    ],
    temperature: 0.7,
  });

  const reply = res.choices[0].message.content;
  console.log("AI raw reply:", reply);

  try {
    // พยายามหา JSON object ต้นแรกในข้อความตอบกลับ
    const jsonStart = reply.indexOf("{");
    if (jsonStart === -1) {
      throw new Error("No JSON object found in AI reply");
    }
    const jsonText = reply.slice(jsonStart);
    return JSON.parse(jsonText);
  } catch (e) {
    console.error("Failed to parse AI reply as JSON:", e);
    return { playlist: [], reason: "" };
  }
}
