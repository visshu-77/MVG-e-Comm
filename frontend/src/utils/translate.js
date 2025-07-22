import axiosInstance from '../api/axiosConfig';

// LibreTranslate API utility
export async function translateText(text, target) {
  const res = await axiosInstance.post('/translate', {
    text,
    target,
  });
  return res.data.translation;
} 