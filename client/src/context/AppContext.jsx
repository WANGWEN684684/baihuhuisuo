import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [avatar, setAvatar] = useState(null);
  const [moments, setMoments] = useState([]);
  const [chats, setChats] = useState([]);
  const [formData, setFormData] = useState({
    zodiac: '',
    constellation: '',
    mbti: '',
    description: ''
  });
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const resetData = () => {
    setAvatar(null);
    setMoments([]);
    setChats([]);
    setFormData({
      zodiac: '',
      constellation: '',
      mbti: '',
      description: ''
    });
    setAnalysisResult(null);
    setError(null);
  };

  return (
    <AppContext.Provider value={{
      avatar, setAvatar,
      moments, setMoments,
      chats, setChats,
      formData, setFormData,
      analysisResult, setAnalysisResult,
      loading, setLoading,
      error, setError,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
