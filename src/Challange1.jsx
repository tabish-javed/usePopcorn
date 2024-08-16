// `https://api.frankfurter.app/latest?amount=100&from=EUR&to=USD`

import { useEffect, useState } from "react";

export default function App () {
  const [amount, setAmount] = useState(1)
  const [fromCurrency, setFromCurrency] = useState("USD")
  const [toCurrency, setToCurrency] = useState("EUR")
  const [convertedValue, setConvertedValue] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    async function getConversion () {
      try {
        setIsLoading(true)
        const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${fromCurrency}&to=${toCurrency}`)

        // determine whether response should be convered to json by inspecting content-type property on headers
        // console.log(res.headers.get("content-type"));
        const data = await res.json()
        setConvertedValue(data.rates[toCurrency])
      } catch (error) {
        console.log(error)
      } finally {
        setIsLoading(false)
      }
    }

    // returning from guard clause will return on true condition and also does/set something.
    if (amount === 0 || fromCurrency === toCurrency) return setConvertedValue(amount)
    getConversion()

  }, [amount, fromCurrency, toCurrency])

  return (
    <div>
      <input
        type="text"
        value={ amount }
        onChange={ (e) => setAmount(Number(e.target.value)) }
        disabled={ isLoading }
      />
      <select
        value={ fromCurrency }
        onChange={ (e) => setFromCurrency(e.target.value) }
        disabled={ isLoading }
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      <select
        value={ toCurrency }
        onChange={ (e) => setToCurrency(e.target.value) }
        disabled={ isLoading }
      >
        <option value="USD">USD</option>
        <option value="EUR">EUR</option>
        <option value="CAD">CAD</option>
        <option value="INR">INR</option>
      </select>
      { isLoading ? <p>Converting...</p> : <p>{ convertedValue } { toCurrency }</p> }
    </div>
  );
}
