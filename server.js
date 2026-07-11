require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4004;
const APP_PASSWORD = process.env.APP_PASSWORD;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = 'gemini-2.5-flash-image';

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/generate-image', async (req, res) => {
  if (!APP_PASSWORD || !GEMINI_API_KEY) {
    res.status(500).json({ error: 'サーバー側でAPP_PASSWORDまたはGEMINI_API_KEYが設定されていません。' });
    return;
  }

  const { password, prompt } = req.body || {};

  if (password !== APP_PASSWORD) {
    res.status(401).json({ error: 'パスワードが違います。' });
    return;
  }

  if (!prompt || typeof prompt !== 'string') {
    res.status(400).json({ error: 'プロンプトが指定されていません。' });
    return;
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    if (!geminiRes.ok) {
      const errBody = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errBody);
      res.status(502).json({ error: '画像生成に失敗しました（Gemini APIエラー）。' });
      return;
    }

    const data = await geminiRes.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p) => p.inlineData);

    if (!imagePart) {
      console.error('Gemini response has no image part:', JSON.stringify(data));
      res.status(502).json({ error: '画像データを取得できませんでした。' });
      return;
    }

    res.json({
      mimeType: imagePart.inlineData.mimeType,
      data: imagePart.inlineData.data,
    });
  } catch (err) {
    console.error('Image generation failed:', err);
    res.status(500).json({ error: '画像生成中にエラーが発生しました。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
