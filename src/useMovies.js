import { useState, useEffect, useCallback } from "react";

const KEY = "f833a7ce";
export function useMovies(query, callbackhandleClose) {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = useCallback(() => {
    callbackhandleClose();
  }, [callbackhandleClose]);
  useEffect(() => {
    // callback?.();
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);
        const res = await fetch(
            `http://www.omdbapi.com/?apikey=${KEY}&s=${query}`,
          { signal: controller.signal }
        );
        if (!res.ok)
          throw new Error("Something Went Wrong With Fetching Movies");

        const data = await res.json();
        if (data.Response === "False") throw new Error(data.Error);
        setMovies(data.Search ||[]);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        setIsLoading(false);
        setError("");
      }
    }
     // If the query is too short, clear the movie list and exit early
    if (query.length < 3) {
      setMovies([]);
      return;
    }
    // Close any open components and fetch movies
    handleClose();
    fetchMovies();

    // Cleanup: Abort the fetch request on unmount or when the query changes
    return function () {
      controller.abort();
    };
  }, [query]);
  return { movies, error, isLoading };
}
