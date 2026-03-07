import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUpload = ({ 
  label, 
  files, 
  setFiles, 
  maxFiles = 1, 
  required = false,
  minFiles = 0,
  helperText 
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Validate file types and sizes
    const validFiles = newFiles.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isSmallEnough = file.size <= 5 * 1024 * 1024; // 5MB
      return isImage && isSmallEnough;
    });

    if (validFiles.length !== newFiles.length) {
      alert('部分文件不符合要求（必须是图片且小于5MB）');
    }

    if (maxFiles === 1) {
      setFiles(validFiles[0] || null);
    } else {
      const updatedFiles = [...files, ...validFiles].slice(0, maxFiles);
      setFiles(updatedFiles);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index) => {
    if (maxFiles === 1) {
      setFiles(null);
    } else {
      setFiles(files.filter((_, i) => i !== index));
    }
  };

  const currentCount = maxFiles === 1 ? (files ? 1 : 0) : files.length;

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <label className="block text-gray-700 font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <span className="text-xs text-gray-400">
          {maxFiles > 1 ? `${currentCount}/${maxFiles}` : ''}
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Render existing files */}
        {maxFiles === 1 && files && (
          <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={URL.createObjectURL(files)} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => removeFile(0)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {maxFiles > 1 && files.map((file, index) => (
          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={URL.createObjectURL(file)} 
              alt={`Preview ${index}`} 
              className="w-full h-full object-cover"
            />
            <button 
              onClick={() => removeFile(index)}
              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {currentCount < maxFiles && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-pink-50 transition-colors"
          >
            <Upload className="text-gray-400 mb-1" size={24} />
            <span className="text-xs text-gray-400">上传图片</span>
          </div>
        )}
      </div>

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg"
        multiple={maxFiles > 1}
        className="hidden"
      />
      
      {helperText && (
        <p className="text-xs text-gray-400 mt-2">{helperText}</p>
      )}
      
      {required && currentCount < minFiles && (
        <p className="text-xs text-red-500 mt-1">请至少上传 {minFiles} 张图片</p>
      )}
    </div>
  );
};

export default ImageUpload;
