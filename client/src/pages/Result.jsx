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
      if (avatar) data.append('avatar', avatar);
      moments.forEach(file => data.append('moments', file));
      if (chats) {
        chats.forEach(file => data.append('chats', file));
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
      const errorMessage = err.response?.data?.message || err.message || '网络异常或服务器错误';
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
        <p className="text-gray-400 text-sm mt-4">预计需要 15-30 秒</p>
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
        {analysisResult.warnings && (
          <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              雷区提醒
            </h2>
            <ul className="space-y-4">
              {analysisResult.warnings.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="bg-red-100 text-red-600 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-3 flex-shrink-0 mt-0.5">!</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-top flex space-x-4 border-t border-gray-100 z-10">
        <button 
          onClick={handleRetry}
          className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <RefreshCw className="mr-2 w-5 h-5" />
          重新分析
        </button>
        <button 
          onClick={handleSave}
          className="flex-1 bg-primary text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <Save className="mr-2 w-5 h-5" />
          保存结果
        </button>
      </div>
    </div>
  );
};

export default ResultPage;
