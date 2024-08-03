import { useEffect, useState } from "react";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const KEY = '9d073eb3'  // OMDB API Key (account = tabish@yahoo.com)
const average = (arr) => arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

export default function App () {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedID, setSelectedID] = useState(null)

  /*
    useEffect(() => {
      console.log("After inidial render")
    }, [])

    useEffect(() => {
      console.log("After every render")
    })

    useEffect(() => {
      console.log("D");
    }, [query])

    console.log("During render");
  */

  function handleSelectMovie (id) {
    setSelectedID(prevState => prevState === id ? null : id)
  }

  function handleCloseMovie () {
    setSelectedID(null)
  }

  function handleAddWatched (newMovie) {
    const originalElement = watched.find(element => element.imdbID === newMovie.imdbID)
    const originalIndex = watched.indexOf(originalElement)

    if (newMovie.userRating > 0) {
      if (originalIndex === -1) {
        setWatched(prevState => [...prevState, newMovie])
      } else if (originalElement?.userRating !== newMovie.userRating) {
        setWatched(watched.splice(originalIndex, 1))
        setWatched([...watched, newMovie])
      }
    }
  }


  function handleDeleteWatched (id) {
    setWatched(watched => watched.filter(movie => movie.imdbID !== id))
  }


  // using effect to intract outside world which in here is fetching movies from API
  useEffect(() => {
    const controller = new AbortController()

    async function getMovies () {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })
        const data = await res.json()

        if (!res.ok) throw new Error("Something went wrong in retrieving movies.")
        if (data.Response === "False") throw new Error(data.Error)

        setMovies(data.Search)
        setErrorMessage("")
      } catch (error) {
        if (error.name !== "AbortError") {
          error instanceof TypeError ?
            setErrorMessage("You're offline.") :
            setErrorMessage(error.message)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (query.length <= 3) {
      setMovies([])
      setErrorMessage("")
      return
    }

    handleCloseMovie()
    getMovies()

    // returning clean-up function to be executed before next re-render which aborts the previous API call
    return function () { controller.abort() }
  }, [query])

  return (
    <>
      <NavBar>
        <Search query={ query } setQuery={ setQuery } />
        <NumResults movies={ movies } />
      </NavBar>
      <Main>
        <Box>
          { isLoading && <Loader /> }
          { !isLoading && !errorMessage && <MovieList movies={ movies } onSelectMovie={ handleSelectMovie } /> }
          { !isLoading && errorMessage && <ErrorMessage message={ errorMessage } /> }
        </Box>
        <Box>
          {
            selectedID ?
              <MovieDetails
                selectedID={ selectedID }
                watched={ watched }
                onCloseMovie={ handleCloseMovie }
                onAddWatched={ handleAddWatched }
              /> :
              <>
                <WatchedSummary watched={ watched } />
                <WatchedMoviesList watched={ watched } onDeleteWatched={ handleDeleteWatched } />
              </>
          }
        </Box>
      </Main>
    </>
  );
}


function Loader () {
  return (
    <p className="loader">Loading...</p>
  )
}


function ErrorMessage ({ message }) {
  return (
    <p className="error">
      <span>🛑</span> { message }
    </p>
  )
}


function NavBar ({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      { children }
    </nav>
  )
}


function NumResults ({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{ movies.length }</strong> results
    </p>
  )
}


function Logo () {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  )
}


function Search ({ query, setQuery }) {

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={ query }
      onChange={ (e) => setQuery(e.target.value) }
    />
  )
}


function Main ({ children }) {
  return (
    <main className="main">
      { children }
    </main>
  )
}


function Box ({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={ () => setIsOpen((prevState) => !prevState) }>
        { isOpen ? "-" : "+" }
      </button>
      { isOpen && children }
    </div>
  )
}


/*
function WatchedBox () {
  const [watched, setWatched] = useState(tempWatchedData);
  const [isOpen2, setIsOpen2] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={ () => setIsOpen2((open) => !open) }>
        { isOpen2 ? "–" : "+" }
      </button>
      { isOpen2 && (
        <>
          <WatchedSummary watched={ watched } />
          <WatchedMoviesList watched={ watched } />
        </>
      ) }
    </div>
  )
}
 */


function MovieList ({ movies, onSelectMovie }) {
  return (
    <ul className="list list-movies">
      { movies?.map((movie) => <Movie movie={ movie } key={ movie.imdbID } onSelectMovie={ onSelectMovie } />) }
    </ul>
  )
}


function Movie ({ movie, onSelectMovie }) {
  return (
    <li onClick={ () => onSelectMovie(movie.imdbID) }>
      <img src={ movie.Poster } alt={ `${movie.Title} poster` } />
      <h3>{ movie.Title }</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{ movie.Year }</span>
        </p>
      </div>
    </li>
  )
}

function MovieDetails ({ selectedID, onCloseMovie, onAddWatched, watched }) {
  const [movie, setMovie] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [userRating, setUserRating] = useState("")

  const isWatched = watched.map(element => element.imdbID).includes(selectedID)
  const watchedUserRating = watched.find(element => element.imdbID === selectedID)?.userRating

  const {
    Title: title,
    Poster: poster,
    Runtime: runtime,
    Year: year,
    imdbRating,
    Plot: plot,
    Released: released,
    Actors: actors,
    Director: director,
    Genre: genre
  } = movie

  function handleAdd () {
    const newWatchedMovie = {
      imdbID: selectedID,
      title,
      year,
      poster,
      imdbRating: Number(imdbRating),
      runtime: Number(runtime.split("").at(0)),
      userRating
    }
    onAddWatched(newWatchedMovie)
    onCloseMovie()
  }


  // listening to escape key to close movie detail (we must have cleanup function returned)
  useEffect(() => {
    function callback (e) {
      if (e.code === "Escape") {
        onCloseMovie()
      }
    }
    document.addEventListener("keydown", callback)

    return () => {
      document.removeEventListener('keydown', callback)
    }
  }, [onCloseMovie])


  // intracting outside world to fetch selected movie detail
  useEffect(() => {
    async function getMovieDetails () {
      setErrorMessage("")
      try {
        setIsLoading(true)
        setErrorMessage("")
        const res = await fetch(`http://www.omdbapi.com/?apikey=${KEY}&i=${selectedID}`)
        const data = await res.json()
        setMovie(data)

        if (!res.ok) throw new Error("Something went wrong in getting movie detail")
        if (data.Response === "False") throw new Error(data.Error)
      } catch (error) {
        error instanceof TypeError ?
          setErrorMessage("You're offline.") :
          setErrorMessage(error.message)
      } finally {
        setIsLoading(false)
      }
    }
    getMovieDetails()
  }, [selectedID])


  // intracting outside world using this effect which resets document.title
  useEffect(() => {
    if (!title) return
    document.title = `Movie | ${title}`

    // returning function to reset docuemnt.title back to original text
    return () => { document.title = "usePopcorn" }
  }, [title])

  return (
    <div className="details">
      { isLoading ? <Loader /> :
        <>
          <header>
            <button className="btn-back" onClick={ onCloseMovie } >&larr;</button>
            <img src={ poster } alt={ `Poster of ${title} movie` } />
            <div className="details-overview">
              <h2>{ title }</h2>
              <p>{ released } &bull; { runtime }</p>
              <p>{ genre }</p>
              <p><span>⭐️</span>{ imdbRating } IMDB rating</p>
            </div>
          </header>
          <section>
            <div className="rating">
              { !isWatched &&
                <>
                  <StarRating maxRating={ 10 } size={ 24 } onSetRating={ setUserRating } />
                  <button className="btn-add" onClick={ handleAdd }>+ Add to list</button>
                </>

              }
              { isWatched &&
                <>
                  <p>Movie exist in the list and you rated { watchedUserRating } ⭐️</p>
                  <StarRating maxRating={ 10 } size={ 24 } onSetRating={ setUserRating } />
                  <button className="btn-add" onClick={ handleAdd }>Update Rating</button>
                </>
              }
            </div>
            <p><em>{ plot }</em></p>
            <p>Starring { actors }</p>
            <p>Directed by { director }</p>
          </section>
        </>
      }
    </div>
  )
}


function WatchedSummary ({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating)).toFixed(2);
  const avgUserRating = average(watched.map((movie) => movie.userRating)).toFixed(2);
  const avgRuntime = average(watched.map((movie) => movie.runtime)).toFixed(2);

  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{ watched.length } movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{ avgImdbRating }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ avgUserRating }</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{ avgRuntime } min</span>
        </p>
      </div>
    </div>
  )
}


function WatchedMoviesList ({ watched, onDeleteWatched }) {
  return (
    <ul className="list">
      { watched.map((movie) => <WatchedMovie movie={ movie } key={ movie.imdbID } onDeleteWatched={ onDeleteWatched } />) }
    </ul>
  )
}


function WatchedMovie ({ movie, onDeleteWatched }) {
  return (
    <li >
      <img src={ movie.poster } alt={ `${movie.title} poster` } />
      <h3>{ movie.title }</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{ movie.imdbRating }</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{ movie.userRating }</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{ movie.runtime } min</span>
        </p>
        <button className="btn-delete" onClick={ () => onDeleteWatched(movie.imdbID) }>X</button>
      </div>
    </li>
  )
}
