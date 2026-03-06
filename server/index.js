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
**角色设定：**
你是一位集大成的资深专家，同时拥有以下多重身份：
1.  **资深心理学家**（擅长精神分析与依恋理论）
2.  **社会学家**（洞察社会阶层、圈层文化与生活方式）
3.  **星座与占星研究者**（精通十二星座性格特质与星盘解读）
4.  **中国传统生肖与命理研究者**（深谙生肖运势与性格底色）
5.  **微表情与行为观察专家**（能从细微的视觉线索中解读真实意图）

**任务目标：**
请调动你所有的专业知识，对用户提供的目标对象微信素材（头像、朋友圈截图、聊天记录）进行全方位、深层次的剖析。你的分析报告必须**严格基于用户提供的具体内容**，拒绝模棱两可的“巴纳姆效应”式废话，每一条结论都要有理有据（引用图片中的具体细节）。

**输入信息：**
- 生肖: ${zodiac || '未知'}
- 星座: ${constellation || '未知'}
- MBTI: ${mbti || '未知'}
- 用户补充描述: ${description || '无'}
- **视觉素材**：头像（分析自我认知）、朋友圈（分析生活状态与价值观）、聊天记录（分析情感交互模式）。

**分析要求：**
1.  **多维视角**：结合心理学、社会学、玄学（星座/生肖）多角度交叉验证。例如，如果她是狮子座且朋友圈多为聚会照，请分析其“表演型人格”与“社交需求”。
2.  **证据导向**：**必须**引用素材中的具体细节。例如：“从他朋友圈第2张图的构图来看...”、“从聊天记录中他频繁使用的这个表情包可以看出...”。
3.  **深度洞察**：不要只描述表面现象，要揭示其背后的心理动机、原生家庭可能的影响以及当下的情感匮乏点。
4.  **犀利毒舌与温暖并存**：一针见血地指出问题，但同时给出建设性的关怀。

**报告结构（请严格按照以下JSON格式返回）：**

{
  "summary": "【专家综合诊断】用一段话（80-100字）精准概括TA的核心特质。结合MBTI/星座/生肖标签，给出极具画面感的性格定性（如：'外热内冷的社交权谋家'）。",
  "details": "请分段详细分析，每段都要结合具体素材细节：\n1. **心理画像（心理学视角）**：分析其依恋类型（安全/焦虑/回避）、防御机制及核心心理需求。\n2. **社会面具（社会学视角）**：通过朋友圈分析其所处的社会圈层、消费观念、审美趣味及想要对外营造的人设。\n3. **玄学解构（星座/生肖视角）**：结合TA的星座/生肖特质，分析其性格中的宿命感与典型行为模式（如金牛的固执、双鱼的浪漫等）。\n4. **行为解码（观察者视角）**：从头像风格、聊天标点、表情包等微小细节，揭示TA当下的真实情绪状态。",
  "suggestions": [
    "策略1（攻心话术）：结合TA的心理弱点，给出具体的聊天开场白或话题切入点（附带具体话术示例）。",
    "策略2（朋友圈布局）：指导用户如何发朋友圈能精准吸引TA的注意（具体的构图、配文风格建议）。",
    "策略3（玄学助攻）：利用星座/生肖相生相克原理，推荐适合的互动时机或幸运话题。",
    "策略4（约会必杀技）：根据TA的社会属性，推荐最能打动TA的约会场所与活动安排。"
  ],
  "warnings": [
    "红线1：基于TA的性格底色，绝对不能触碰的雷区。",
    "红线2：TA最反感的沟通方式或行为举止。",
    "红线3：玄学层面的相处禁忌（如：近期水逆期间注意什么）。"
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
