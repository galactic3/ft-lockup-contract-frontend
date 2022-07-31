import { useState, useEffect } from 'react';

function getStorageValue(key: string, defaultValue: any) {
  const value = localStorage.getItem(key);
  if (value) {
    return JSON.parse(value);
  }
  return defaultValue;
}

function useLocalStorage(key: string, defaultValue: any) {
  const [value, setValue] = useState(() => getStorageValue(key, defaultValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

export default useLocalStorage;
