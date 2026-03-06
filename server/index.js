const express = require('express');
const cors = require('cors');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

console.log('Server is starting...'); // Add startup log
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Set up multer for file uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit per file
});

// Serve static files from the React client app
app.use(express.static(path.join(__dirname, '../client/dist')));

// Helper to convert buffer to base64 data URL
const bufferToDataUrl = (buffer, mimetype) => {
  const base64 = buffer.toString('base64');
  return `data:${mimetype};base64,${base64}`;
};

// Endpoint for analysis
app.post('/api/analyze', upload.any(), async (req, res) => {
  try {
    const { 
      zodiac, 
      constellation, 
      mbti, 
      description 
    } = req.body;

    const files = req.files || [];
    
    // Categorize files
    const avatarFile = files.find(f => f.fieldname === 'avatar');
    const momentFiles = files.filter(f => f.fieldname === 'moments');
    const chatFiles = files.filter(f => f.fieldname === 'chats');

    if (!avatarFile || momentFiles.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required files (avatar or moments)' });
    }

    // Construct the prompt
    let promptText = `
你是一个专业的恋爱交友分析助手。请根据用户提供的目标对象微信素材进行深度分析。

目标对象信息：
- 生肖: ${zodiac || '未知'}
- 星座: ${constellation || '未知'}
- MBTI: ${mbti || '未知'}
- 用户补充描述: ${description || '无'}

请分析以下内容：
1. 核心总结（1句话概括目标对象核心特质）
2. 详细分析（性格特质、兴趣偏好、相处偏好）
3. 交友建议（至少3条，具体可落地）
4. 雷区提醒（3-5条，明确禁忌）

请以JSON格式返回结果，不要包含Markdown格式标记，直接返回JSON对象。
JSON结构如下：
{
  "summary": "...",
  "details": "...",
  "suggestions": ["...", "...", "..."],
  "warnings": ["...", "..."]
}
`;

    // Prepare content for the API
    const content = [
      { type: "text", text: promptText }
    ];

    // Add Avatar
    if (avatarFile) {
      content.push({
        type: "text",
        text: "这是目标对象的微信头像："
      });
      content.push({
        type: "image_url",
        image_url: {
          url: bufferToDataUrl(avatarFile.buffer, avatarFile.mimetype)
        }
      });
    }

    // Add Moments
    if (momentFiles.length > 0) {
      content.push({
        type: "text",
        text: "以下是目标对象的朋友圈截图："
      });
      momentFiles.forEach((file, index) => {
        content.push({
          type: "image_url",
          image_url: {
            url: bufferToDataUrl(file.buffer, file.mimetype)
          }
        });
      });
    }

    // Add Chats
    if (chatFiles.length > 0) {
      content.push({
        type: "text",
        text: "以下是与目标对象的聊天记录截图："
      });
      chatFiles.forEach((file, index) => {
        content.push({
          type: "image_url",
          image_url: {
            url: bufferToDataUrl(file.buffer, file.mimetype)
          }
        });
      });
    }

    const apiKey = process.env.ARK_API_KEY;
    if (!apiKey) {
      console.warn("No ARK_API_KEY found.");
      return res.status(500).json({ success: false, message: 'Server configuration error: API Key missing' });
    }

    console.log("Calling Doubao API with model: ep-20250306165603-kf74f");
    
    // Call Doubao API
    // Note: You need to verify the correct endpoint and model name for Doubao Vision
    // Assuming standard OpenAI compatible endpoint provided by Volcengine
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: "ep-20250306165603-kf74f",
        messages: [
          {
            role: "user",
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 120000 // 120s timeout for AI
      }
    );

    console.log("Doubao API response received.");
    
    // Parse the response
    const aiContent = response.data.choices[0].message.content;
    
    // Try to parse JSON from the text response
    let parsedData;
    try {
      // Remove markdown code blocks if present
      const jsonString = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse JSON from AI response:", aiContent);
      // Fallback if not valid JSON
      parsedData = {
        summary: "AI分析完成，但格式解析失败。",
        details: aiContent,
        suggestions: [],
        warnings: []
      };
    }

    res.json({
      success: true,
      data: parsedData
    });

  } catch (error) {
    console.error('Analysis error:', error.response ? error.response.data : error.message);
    res.status(500).json({ 
      success: false, 
      message: '服务器内部错误: ' + (error.response ? JSON.stringify(error.response.data) : error.message) 
    });
  }
});

// All other GET requests not handled before will return the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Export the app for Vercel serverless
module.exports = app;

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
