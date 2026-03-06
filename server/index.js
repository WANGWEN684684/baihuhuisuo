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
你是一个拥有10年经验的资深情感分析师和心理咨询师，擅长通过社交媒体痕迹深度解读人物性格和情感状态。请根据用户提供的目标对象微信素材（头像、朋友圈、聊天记录）进行深度、专业且有趣的分析。

目标对象信息：
- 生肖: ${zodiac || '未知'}
- 星座: ${constellation || '未知'}
- MBTI: ${mbti || '未知'}
- 用户补充描述: ${description || '无'}

请基于以上信息和上传的图片素材，输出一份详细的分析报告。

**分析要求：**
1.  **深度挖掘**：不要只看表面，要结合心理学知识，分析其潜意识的性格特征、价值观和情感需求。
2.  **语言风格**：专业中带着幽默，犀利又不失温暖，像一个这就懂你的老朋友在给你支招。
3.  **细节控**：请特别注意头像的风格、朋友圈的发布频率/配文/配图细节、聊天记录的语气/标点/表情包使用习惯，从中寻找蛛丝马迹。
4.  **丰富性**：每个部分的内容要充实，不要只有一两句话。

**报告结构（请严格按照以下JSON格式返回）：**

{
  "summary": "请用一段话（50-80字）精准概括TA的核心特质，要一针见血，直击灵魂。",
  "details": "请分段详细分析TA的性格画像。包括：\n1. **显性性格**：外在表现出来的样子。\n2. **隐性性格**：内心深处不为人知的一面。\n3. **生活方式**：从朋友圈看TA的消费观、兴趣爱好和生活品质。\n4. **情感模式**：推测TA在感情中是主动型还是被动型，是安全型依恋还是回避型依恋。",
  "suggestions": [
    "建议1：针对TA的性格，具体的聊天开场白或话题切入点（给具体的例子）。",
    "建议2：如何通过朋友圈互动来引起TA的注意（具体的点赞/评论策略）。",
    "建议3：约会建议（适合TA的约会地点、活动和穿搭风格）。",
    "建议4：情感升温技巧（如何从普通朋友过渡到暧昧对象）。"
  ],
  "warnings": [
    "雷区1：绝对不能踩的底线（例如：不要秒回、不要查户口等）。",
    "雷区2：TA可能反感的沟通方式。",
    "雷区3：相处中需要注意的细节。"
  ]
}

请确保返回的是标准的 JSON 格式，不要包含 Markdown 标记（如 \`\`\`json ... \`\`\`），直接返回 JSON 对象。
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
