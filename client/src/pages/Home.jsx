import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-pink-50 to-white flex flex-col items-center justify-center p-6 text-center overflow-y-auto">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
          <Heart className="text-white w-12 h-12 fill-current animate-pulse" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">AI心动探测器</h1>
        <p className="text-gray-600 text-lg">AI深度解读，助你心动成真</p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 mb-8"
      >
        <div className="space-y-4 text-left mb-8">
          <div className="flex items-start">
            <div className="bg-pink-100 p-2 rounded-lg mr-3">
              <span className="text-xl">🔍</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">深度分析</h3>
              <p className="text-sm text-gray-500">上传微信素材，AI解读性格特质</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-blue-100 p-2 rounded-lg mr-3">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">实操建议</h3>
              <p className="text-sm text-gray-500">获取定制化聊天话题与相处技巧</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <span className="text-xl">⚠️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">避雷指南</h3>
              <p className="text-sm text-gray-500">精准识别雷区，避免无效沟通</p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => navigate('/upload')}
          className="w-full bg-primary hover:bg-red-500 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-all transform active:scale-95 flex items-center justify-center"
        >
          开始分析 <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </motion.div>

      <p className="text-xs text-gray-400 mt-auto pb-4">
        基于豆包大模型 · 隐私安全保护
      </p>
    </div>
  );
};

export default Home;
