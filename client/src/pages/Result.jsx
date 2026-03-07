import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import axios from 'axios';
import { Loader2, AlertCircle, RefreshCw, Save } from 'lucide-react';
import { motion } from 'framer-motion';

const ResultPage = () => {
  const navigate = useNavigate();
  const { 
    avatar, moments, chats, formData, 
    analysisResult, setAnalysisResult, 
    loading, setLoading, 
    error, setError 
  } = useApp();

  const performAnalysis = useCallback(async () => {
    if (!avatar || moments.length === 0) {
      navigate('/');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      
      // Helper function to compress image if needed
      const compressImage = async (file, maxSizeMB = 0.5) => { // Reduced to 0.5MB for faster upload
        if (file.size <= maxSizeMB * 1024 * 1024) return file;
        
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              
              // Scale down if too large
              const maxDimension = 1024; // Reduced to 1024px
              if (width > maxDimension || height > maxDimension) {
                if (width > height) {
                  height = Math.round((height * maxDimension) / width);
                  width = maxDimension;
                } else {
                  width = Math.round((width * maxDimension) / height);
                  height = maxDimension;
                }
              }
              
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0, width, height);
              
              canvas.toBlob((blob) => {
                const newFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(newFile);
              }, 'image/jpeg', 0.6); // 0.6 quality
            };
          };
        });
      };

      if (avatar) {
        const compressedAvatar = await compressImage(avatar);
        data.append('avatar', compressedAvatar);
      }
      
      for (const file of moments) {
        const compressedFile = await compressImage(file);
        data.append('moments', compressedFile);
      }
      
      if (chats) {
        for (const file of chats) {
          const compressedFile = await compressImage(file);
          data.append('chats', compressedFile);
        }
      }
      
      data.append('zodiac', formData.zodiac || '');
      data.append('constellation', formData.constellation || '');
      data.append('mbti', formData.mbti || '');
      data.append('description', formData.description || '');

      // Use relative path for API calls
      const apiUrl = '/api/analyze';
      console.log('Sending request to:', apiUrl);
      
      const response = await axios.post(apiUrl, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // Increased timeout to 120s
      });

      if (response.data.success) {
        setAnalysisResult(response.data.data);
      } else {
        setError(response.data.message || '分析失败，请重试');
      }
    } catch (err) {
      console.error(err);
      let errorMessage = '网络异常或服务器错误';
      if (err.response?.status === 413) {
        errorMessage = '上传的图片总大小太大，请减少图片数量或使用更小的图片';
      } else if (err.response?.status === 504 || err.code === 'ECONNABORTED') {
        errorMessage = 'AI 思考时间过长，请尝试减少上传的图片数量（建议只传 3-5 张关键图）后再试';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      setError(errorMessage + '，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [avatar, moments, chats, formData, navigate, setAnalysisResult, setLoading, setError]);

  useEffect(() => {
    if (!analysisResult && !loading && !error) {
      performAnalysis();
    }
  }, [analysisResult, loading, error, performAnalysis]);

  const handleRetry = () => {
    navigate('/upload');
  };

  const handleSave = () => {
    alert('请使用手机截图功能保存结果');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-primary mb-4" />
        </motion.div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">AI正在深度分析...</h2>
        <p className="text-gray-600">正在解读TA的性格特质与潜在心意</p>
        <p className="text-gray-400 text-sm mt-4">分析过程可能需要30-60秒，请耐心等待...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-800 mb-2">分析遇到问题</h2>
        <p className="text-gray-600 mb-8">{error}</p>
        <button 
          onClick={performAnalysis}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-md active:scale-95"
        >
          重试
        </button>
        <button 
          onClick={() => navigate('/')}
          className="text-gray-500 mt-4 underline"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (!analysisResult) return null;

  return (
    <div className="min-h-[100dvh] bg-gray-50 pb-24 overflow-y-auto">
      <div className="bg-primary p-6 text-white rounded-b-3xl shadow-lg mb-6">
        <h1 className="text-2xl font-bold mb-2">心动分析报告</h1>
        <p className="opacity-90 text-lg">{analysisResult.summary}</p>
      </div>

      <div className="px-4 space-y-6">
        {/* Avatar Analysis */}
        {analysisResult.avatar_analysis && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🧐</span>
              头像辣评
            </h2>
            <div className="text-gray-700 italic font-medium">
              "{analysisResult.avatar_analysis}"
            </div>
          </div>
        )}

        {/* Detailed Analysis */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-blue-500 mr-2 rounded-full"></span>
            详细分析
          </h2>
          <div className="text-gray-600 space-y-2 whitespace-pre-wrap leading-relaxed">
            {analysisResult.details}
          </div>
        </div>

        {/* Icebreaker */}
        {analysisResult.icebreaker && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl shadow-sm p-6 border border-pink-100">
            <h2 className="text-lg font-bold text-pink-600 mb-4 flex items-center">
              <span className="text-2xl mr-2">🧊</span>
              破冰关键
            </h2>
            <div className="text-gray-800 font-bold text-lg">
              {analysisResult.icebreaker}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {analysisResult.suggestions && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">💡</span>
              交友建议
            </h2>
            <ul className="space-y-4">
              {analysisResult.suggestions.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="bg-green-100 text-green-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-0.5">{idx + 1}</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Warnings */}
        <div className="bg-red-50 rounded-xl shadow-sm p-6 border border-red-100">
          <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center">
            <span className="w-1 h-6 bg-red-500 mr-2 rounded-full"></span>
            雷区提醒
          </h2>
          <ul className="space-y-3">
            {analysisResult.warnings.map((warning, index) => (
              <li key={index} className="flex items-start text-red-700">
                <span className="mr-2 mt-1">⚠️</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Difficulty Score */}
        {analysisResult.difficulty_score && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              难追指数
            </h2>
            <div className="flex items-center justify-between mb-4">
              <div className="w-full bg-gray-200 rounded-full h-4 mr-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-1000 ease-out ${
                    analysisResult.difficulty_score.score > 80 ? 'bg-red-500' :
                    analysisResult.difficulty_score.score > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${analysisResult.difficulty_score.score}%` }}
                ></div>
              </div>
              <span className={`text-2xl font-bold ${
                analysisResult.difficulty_score.score > 80 ? 'text-red-500' :
                analysisResult.difficulty_score.score > 50 ? 'text-yellow-500' : 'text-green-500'
              }`}>
                {analysisResult.difficulty_score.score}
              </span>
            </div>
            <p className="text-gray-600 text-sm italic">
              {analysisResult.difficulty_score.explanation}
            </p>
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button 
            onClick={handleRetry}
            className="flex-1 bg-white border border-gray-200 text-gray-600 py-3 rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 active:scale-95"
          >
            <RefreshCw size={20} />
            再测一个
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <Save size={20} />
            保存结果
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
