import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const UploadPage = () => {
  const navigate = useNavigate();
  const { 
    avatar, setAvatar, 
    moments, setMoments, 
    chats, setChats 
  } = useApp();

  const handleNext = () => {
    // Validation
    if (!avatar) {
      alert('请上传目标对象微信头像');
      return;
    }
    if (moments.length < 5) {
      alert('请至少上传5张朋友圈截图');
      return;
    }
    navigate('/form');
  };

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10 relative">
        <button onClick={() => navigate('/')} className="mr-4 p-1 active:bg-gray-100 rounded-full">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">上传素材</h1>
      </div>

      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-primary mr-2 rounded-full"></span>
            基础信息
          </h2>
          
          <ImageUpload 
            label="微信头像" 
            required
            maxFiles={1}
            files={avatar}
            setFiles={setAvatar}
            helperText="建议上传清晰的头像，AI将分析其风格与特质"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-secondary mr-2 rounded-full"></span>
            朋友圈动态
          </h2>
          
          <ImageUpload 
            label="朋友圈截图" 
            required
            minFiles={5}
            maxFiles={9}
            files={moments}
            setFiles={setMoments}
            helperText="请上传5-9张朋友圈截图，包含日常分享、动态等，越丰富分析越准"
          />
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-purple-500 mr-2 rounded-full"></span>
            聊天记录 (可选)
          </h2>
          
          <ImageUpload 
            label="聊天截图" 
            maxFiles={9}
            files={chats}
            setFiles={setChats}
            helperText="上传你们的日常对话截图，帮助AI分析相处模式与情感倾向"
          />
        </div>
      </motion.div>

      <div className="bg-white p-4 shadow-top">
        <button 
          onClick={handleNext}
          className="w-full bg-primary hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
        >
          下一步 <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
