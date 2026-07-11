require('dotenv').config({ quiet: true });
const express = require('express');

const app = express();
const PORT = process.env.PORT || 4004;
const APP_PASSWORD = process.env.APP_PASSWORD;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_IMAGE_MODEL = 'gpt-image-1';

app.use(express.json());
app.use(express.static(__dirname));

app.post('/api/generate-image', async (req, res) => {
  if (!APP_PASSWORD || !OPENAI_API_KEY) {
    res.status(500).json({ error: 'サーバー側でAPP_PASSWORDまたはOPENAI_API_KEYが設定されていません。' });
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
    const openaiRes = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt,
        size: '1024x1024',
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      console.error('OpenAI API error:', openaiRes.status, errBody);
      res.status(502).json({ error: '画像生成に失敗しました（OpenAI APIエラー）。' });
      return;
    }

    const data = await openaiRes.json();
    const b64 = data?.data?.[0]?.b64_json;

    if (!b64) {
      console.error('OpenAI response has no image data:', JSON.stringify(data));
      res.status(502).json({ error: '画像データを取得できませんでした。' });
      return;
    }

    res.json({
      mimeType: 'image/png',
      data: b64,
    });
  } catch (err) {
    console.error('Image generation failed:', err);
    res.status(500).json({ error: '画像生成中にエラーが発生しました。' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
