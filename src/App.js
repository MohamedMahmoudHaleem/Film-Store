import { useEffect, useRef, useState } from "react";
import StarRating from "./StarRating.jsx";
import { useMovies } from "./useMovies.js";
import { UseLocalStorage } from "./useLocalStorageState.js";

const average = (arr) => {
  if (arr.length === 0) return 0;
  return arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);
};
const KEY = "f833a7ce";
export default function App() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const { movies, error, isLoading } = useMovies(query, handleCloseMovie);
  const { watched, setWatched } = UseLocalStorage("watched");

  function handleSelectMovie(id) {
    setSelectedId((selectedId) => (selectedId === id ? null : id));
  }
  function handleCloseMovie() {
    setSelectedId(null);
  }

  function handleAddWatched(movie) {
    setWatched((watched) => [...watched, movie]);

    // localStorage.setItem("watched", JSON.stringify([...watched, movie]));
  }
  function handleDeleteWatched(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }
  return (
    <>
      <NavBar>
        <MovieSearch query={query} setQuery={setQuery} />
        <NumResults movies={movies} />
      </NavBar>

      <Main>
        <Box>
          {error ? (
            <ErrorMessage message={error} />
          ) : isLoading ? (
            <Loader />
          ) : (
            <SearchListMovies
              movies={movies}
              onSelectMovie={handleSelectMovie}
            />
          )}
        </Box>

        <Box>
          {selectedId ? (
            <MovieDetalis
              watchedMovies={watched}
              selectedId={selectedId}
              onCloseMovie={handleCloseMovie}
              onAddWatched={handleAddWatched}
            />
          ) : (
            <>
              <NumOfMoviesWatched watched={watched} />
              <WatchedMoviesList
                watched={watched}
                onDeleteWatched={handleDeleteWatched}
              />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}
function Loader() {
  return <p className="loader">Loading...</p>;
}
function ErrorMessage({ message }) {
  return (
    <p className="error">
      <span>⛔</span>
      {message}
    </p>
  );
}
function NavBar({ children }) {
  return (
    <>
      {/* navComponent */}
      <nav className="nav-bar">
        <Logo />
        {children}
      </nav>
    </>
  );
}
function MovieSearch({ query, setQuery }) {
  const input = useRef(null);
  useEffect(() => {
    function callback(e) {
      if (document.activeElement === input.current) return;
      if (e.key === "Enter") {
        input.current.focus();
        setQuery("");
      }
    }
    document.addEventListener("keydown", callback);
    return () => document.removeEventListener("keydown", callback);
  }, [setQuery]);
  return (
    <>
      <input
        className="search"
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        ref={input}
      />
    </>
  );
}
function Logo() {
  return (
    <>
      <div className="logo">
        <span role="img">🎬</span>
        <h1>Film Store</h1>
      </div>
    </>
  );
}
function NumResults({ movies }) {
  return (
    <p className="num-results">
      Found <strong style={{ color: "black" }}>{movies?.length}</strong> results
    </p>
  );
}
function Main({ children }) {
  return <main className="main">{children}</main>;
}
function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <>
      <div className="box">
        <button
          className="btn-toggle"
          onClick={() => setIsOpen((open) => !open)}
        >
          {isOpen ? "–" : "+"}
        </button>
        {isOpen && children}
      </div>
    </>
  );
}
function SearchListMovies({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <SearchMovie
          movie={movie}
          key={movie.imdbID}
          onSelectMovie={onSelectMovie}
        />
      ))}
    </ul>
  );
}
function SearchMovie({ movie, onSelectMovie }) {
  return (
    <li onClick={() => onSelectMovie(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>📅</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}
function MovieDetalis({
  watchedMovies,
  selectedId,
  onCloseMovie,
  onAddWatched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [userRating, setUserRating] = useState("");
  const countRef = useRef(0);
  useEffect(() => {
    if (userRating) countRef.current = countRef.current++;
  }, [userRating]);
  const isWatched = watchedMovies.map((mov) => mov.imdbID).includes(selectedId);
  const watchedUserRating = watchedMovies.find(
    (movie) => movie.imdbID === selectedId
  )?.userRating;

  const {
    Title: title,
    Year: year,
    Poster: poster,
    Plot: plot,
    Director: director,
    Runtime: runtime,
    imdbRating,
    Released: released,
    Actors: actors,
    Genre: genre,
  } = movie;

  function handleAdd() {
    const newWatchedMovie = {
      poster,
      imdbID: selectedId,
      title,
      year,
      userRating,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split(" ").at(0)),
      countRatingDecisions: countRef.current,
    };
    onAddWatched(newWatchedMovie);

    onCloseMovie();
  }
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        onCloseMovie();
      }
    });
    return () => {
      document.removeEventListener("keydown", onCloseMovie);
    };
  }, [onCloseMovie]);

  useEffect(() => {
    async function getMoviesDetalis() {
      setIsLoading(true);
      const res = await fetch(
        `http://www.omdbapi.com/?apikey=${KEY}&i=${selectedId}`
      );
      const data = await res.json();
      setMovie(data);
      setIsLoading(false);
    }
    getMoviesDetalis();
  }, [selectedId]);
  useEffect(() => {
    if (!title) return;
    document.title = `Movie | ${title}`;
    return () => {
      document.title = "Film Store";
    };
  }, [title]);
  return (
    <div className="details">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={onCloseMovie}>
              {" "}
              &larr;
            </button>
            <img src={poster} alt={`poster of a ${movie}`} />
            <div className="details-overview">
              <h2>{title}</h2>
              <p>{released} &bull;</p>
              <p>{genre}</p>
              <p>
                <span>⭐</span>
                {imdbRating} IMDb rating
              </p>
            </div>
          </header>

          <section>
            <div className="rating">
              {!isWatched ? (
                <>
                  <StarRating
                    maxRating={10}
                    size={24}
                    onSetRating={setUserRating}
                  />
                  {userRating > 0 && (
                    <button className="btn-add" onClick={handleAdd}>
                      + Add to list
                    </button>
                  )}
                </>
              ) : (
                <p className="rated">
                  you rated that movie <span>{watchedUserRating} ⭐</span>
                </p>
              )}
            </div>

            <p>
              {" "}
              <em>{plot}</em>
            </p>
            <p>Starring {actors}</p>
            <p>Directed by {director}</p>
          </section>
        </>
      )}
    </div>
  );
}
function NumOfMoviesWatched({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched?.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime} min</span>
        </p>
      </div>
    </div>
  );
}
function WatchedMoviesList({ watched, onDeleteWatched }) {
  return (
    <>
      {/* listing of movies you watched component */}
      <ul className="list">
        {watched?.map((movie) => (
          <WatchedMovie
            movie={movie}
            key={movie.imdbID}
            onDeleteWatched={onDeleteWatched}
          />
        ))}
      </ul>
    </>
  );
}

function WatchedMovie({ movie, onDeleteWatched }) {
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button
          className="btn-delete"
          onClick={() => onDeleteWatched(movie.imdbID)}
        >
          x
        </button>
      </div>
    </li>
  );
}
