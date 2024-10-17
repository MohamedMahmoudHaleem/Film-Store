import { useState,useEffect } from "react";

export function UseLocalStorage(key) {
  const [watched, setWatched] = useState(function () {
    const storedValue = localStorage.getItem(key); //returns null if key is not present

    return storedValue ? JSON.parse(storedValue) : [];
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(watched));
  }, [watched,key]);

  return {watched,setWatched} ; 
}
