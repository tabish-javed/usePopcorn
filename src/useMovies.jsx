import { useState, useEffect } from "react"

// const KEY = process.env.API_KEY  // OMDB API Key (account = tabish@yahoo.com)

export function useMovies (query) {
  const KEY = process.env.REACT_APP_API_KEY
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // using effect to intract outside world which in here is fetching movies from API
  useEffect(() => {

    const controller = new AbortController()

    async function getMovies () {
      try {
        setIsLoading(true)
        setErrorMessage("")

        const res = await fetch(`https://www.omdbapi.com/?apikey=${KEY}&s=${query}`, { signal: controller.signal })
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

    // handleCloseMovie()
    // callback?.()
    getMovies()

    // returning clean-up function to be executed before next re-render which aborts the previous API call
    return function () { controller.abort() }
  }, [query])

  return { movies, isLoading, errorMessage }
}