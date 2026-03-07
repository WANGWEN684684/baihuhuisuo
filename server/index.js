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

    // Construct the prompt (Optimized for speed)
    let promptText = `
**角色设定：**
你是一位集心理学、社会学、玄学于一身的资深情感专家。

**任务目标：**
根据用户提供的微信素材（头像、朋友圈、聊天记录），快速输出一份精准、犀利且有趣的分析报告。结论要直击痛点，不要废话。

**输入信息：**
- 生肖: ${zodiac || '未知'}
- 星座: ${constellation || '未知'}
- MBTI: ${mbti || '未知'}
- 用户补充描述: ${description || '无'}

**分析要求：**
1.  **快准狠**：直接给出结论，不需要过多的铺垫。
2.  **多维视角**：结合心理学、社会学、玄学多角度。
3.  **引用细节**：简单提及一两个关键细节即可。

**报告结构（请严格按照以下JSON格式返回）：**

{
  "summary": "【专家综合诊断】用80字左右精准概括TA的核心特质（如：'外热内冷的社交权谋家'）。",
  "avatar_analysis": "【头像鉴人】对头像进行犀利点评（30字以内）。",
  "details": "请分段简要分析：\n1. **心理画像**：依恋类型与核心需求。\n2. **社会面具**：圈层与人设。\n3. **玄学解构**：星座/生肖特质。\n4. **行为解码**：真实情绪状态。",
  "icebreaker": "【破冰关键】一句最能击中灵魂的开场白。",
  "suggestions": [
    "建议1（朋友圈布局）：如何发朋友圈吸引TA。",
    "建议2（玄学助攻）：幸运话题或时机。",
    "建议3（约会必杀技）：推荐活动。",
    "建议4（情感升温）：升温技巧。"
  ],
  "warnings": [
    "红线1：绝对雷区。",
    "红线2：反感行为。",
    "红线3：玄学禁忌。"
  ],
  "difficulty_score": {
    "score": 85,
    "explanation": "简要说明打分理由（20字以内）。"
  },
  "rage_quit": "【如果不追了】请根据TA的性格缺陷，生成一句能瞬间激怒TA、让TA破防的毒舌金句。要极其犀利、一针见血且好笑。例如：'别装了，你朋友圈那岁月静好的样子，掩盖不住你缺爱又自卑的灵魂。'"
}

请确保返回的是标准的 JSON 格式，不要包含 Markdown 标记，直接返回 JSON 对象。
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

    console.log("Calling Doubao API with model: ep-20260306165603-kf74f");
    
    // Call Doubao API
    // Note: You need to verify the correct endpoint and model name for Doubao Vision
    // Assuming standard OpenAI compatible endpoint provided by Volcengine
    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: "ep-20260306165603-kf74f",
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
        timeout: 55000 // Set timeout to 55 seconds (slightly less than Vercel's 60s limit)
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
