import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import ImageUpload from '../components/ImageUpload';
import { ArrowLeft, ArrowRight, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UploadPage = () => {
  const navigate = useNavigate();
  const { 
    avatar, setAvatar, 
    moments, setMoments, 
    chats, setChats 
  } = useApp();

  const [showConfirm, setShowConfirm] = useState(false);
  const chatSectionRef = useRef(null);

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

    // Check if chats are uploaded
    if (!chats || chats.length === 0) {
      setShowConfirm(true);
      return;
    }

    navigate('/form');
  };

  const handleConfirmNext = () => {
    setShowConfirm(false);
    navigate('/form');
  };

  const handleGoToChat = () => {
    setShowConfirm(false);
    // Scroll to chat section
    if (chatSectionRef.current) {
      chatSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden relative">
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

        <div ref={chatSectionRef} className="bg-white rounded-xl shadow-sm p-6 mb-6">
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

      <div className="bg-white p-4 shadow-top z-20 relative">
        <button 
          onClick={handleNext}
          className="w-full bg-primary hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
        >
          下一步 <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">还未上传聊天记录</h3>
                <p className="text-gray-600 text-sm">
                  聊天记录包含大量情感细节，能让 AI 分析你们的对话模式和默契度，结果会更加准确哦！
                </p>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleGoToChat}
                  className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform"
                >
                  去上传聊天记录 (推荐)
                </button>
                <button 
                  onClick={handleConfirmNext}
                  className="w-full bg-gray-100 text-gray-600 font-bold py-3 rounded-xl active:bg-gray-200 transition-colors"
                >
                  不传了，直接下一步
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadPage;
