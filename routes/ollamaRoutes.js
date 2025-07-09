const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/ask-ollama', async (req, res) => {
  try {
    const prompt = req.body.prompt;
    const ollamaRes = await axios.post('http://localhost:11434/api/generate', {
      model: 'llama3',
      prompt,
      stream: false
    });
    res.json({ answer: ollamaRes.data.response });
  } catch (err) {
    res.status(500).json({ error: 'Error communicating with Ollama: ' + err.message });
  }
});

module.exports = router;
