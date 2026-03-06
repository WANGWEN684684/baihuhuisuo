import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const zodiacOptions = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const constellationOptions = ['白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座'];
const mbtiOptions = ['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP', 'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'];

const FormPage = () => {
  const navigate = useNavigate();
  const { formData, setFormData } = useApp();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    navigate('/result'); // Go to result page which will trigger analysis
  };

  return (
    <div className="h-[100dvh] bg-gray-50 flex flex-col overflow-hidden">
      <div className="bg-white p-4 shadow-sm flex items-center shrink-0 z-10 relative">
        <button onClick={() => navigate('/upload')} className="mr-4 p-1 active:bg-gray-100 rounded-full">
          <ArrowLeft className="text-gray-600" />
        </button>
        <h1 className="text-lg font-bold text-gray-800">详细信息</h1>
      </div>

      <motion.div 
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 space-y-6">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <span className="w-1 h-6 bg-secondary mr-2 rounded-full"></span>
            TA的资料 (可选)
          </h2>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">生肖</label>
            <select 
              name="zodiac" 
              value={formData.zodiac} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
            >
              <option value="">请选择生肖</option>
              {zodiacOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">星座</label>
            <select 
              name="constellation" 
              value={formData.constellation} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
            >
              <option value="">请选择星座</option>
              {constellationOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2">MBTI</label>
            <select 
              name="mbti" 
              value={formData.mbti} 
              onChange={handleChange}
              className="w-full p-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white"
            >
              <option value="">请选择MBTI</option>
              {mbtiOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-1 h-6 bg-yellow-400 mr-2 rounded-full"></span>
            补充描述 (可选)
          </h2>
          
          <textarea 
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="补充你与对方的相关情况（如相识背景、接触程度等，例：我和对方是高中同学，不过读书期间接触不多）"
            className="w-full p-3 h-32 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-400 mt-2">
            {formData.description.length}/500
          </div>
        </div>
      </motion.div>

      <div className="bg-white p-4 shadow-top">
        <button 
          onClick={handleNext}
          className="w-full bg-primary hover:bg-red-500 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center"
        >
          提交分析 <ArrowRight className="ml-2 w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FormPage;
