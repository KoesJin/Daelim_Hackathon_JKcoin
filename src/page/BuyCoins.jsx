import React, { useState, useEffect } from "react";
import Chart from "chart.js/auto";
import { useLocation } from "react-router-dom";
import axios from "axios";

export default function BuyCoins() {
  const [chartData, setChartData] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [numberOfCoins, setNumberOfCoins] = useState("");
  const [totalPurchasePrice, setTotalPurchasePrice] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0); // State to hold wallet balance
  const [showBuyForm, setShowBuyForm] = useState(false); // State to toggle buy form
  const [showSellForm, setShowSellForm] = useState(false); // State to toggle sell form
  const [ownedCoins, setOwnedCoins] = useState(null); // State to hold owned coins
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const coinName = searchParams.get("coinName");

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch(
          `https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        if (data?.data?.length > 0) {
          // Transform data to Chart.js format
          const labels = data.data.map((entry) =>
            new Date(entry.time).toLocaleDateString()
          );
          const prices = data.data.map((entry) => parseFloat(entry.priceUsd));

          setChartData({
            labels: labels,
            datasets: [
              {
                label: "Price (USD)",
                data: prices,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                tension: 0.3,
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [coinName]);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const response = await fetch(
          `https://api.coincap.io/v2/assets/${coinName}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setCurrentPrice(parseFloat(data?.data?.priceUsd).toFixed(8)); // Format to 8 decimal places
        setLoading(false); // Update loading state
      } catch (error) {
        console.error("Error fetching current price:", error);
      }
    };

    fetchCurrentPrice();
  }, [coinName]);

  useEffect(() => {
    // Fetch wallet balance from your local server
    const fetchWalletBalance = async () => {
      try {
        // Get user_key from localStorage
        const user_key = localStorage.getItem("user_key");
        if (!user_key) {
          throw new Error("User key not found in localStorage");
        }

        let baseURL = "";
        if (process.env.NODE_ENV === "development") {
          // If in development environment, use local IP
          baseURL = "http://121.139.20.242:5011";
        }

        const response = await axios.post(`${baseURL}/api/key_money`, {
          user_key,
        });

        if (response.data.valid) {
          setWalletBalance(response.data.krw);
        } else {
          console.log("Invalid user or user key");
        }
      } catch (error) {
        console.error("Error fetching wallet balance:", error);
      }
    };

    fetchWalletBalance();
  }, []);
  useEffect(() => {
    // Fetch number of coins owned
    const fetchOwnedCoins = async () => {
      try {
        // Get user_key from localStorage
        const user_key = localStorage.getItem("user_key");
        if (!user_key) {
          throw new Error("User key not found in localStorage");
        }

        let baseURL = "";
        if (process.env.NODE_ENV === "development") {
          // If in development environment, use local IP
          baseURL = "http://121.139.20.242:5011";
        }

        const response = await axios.post(`${baseURL}/api/key_coins`, {
          user_key,
          coinName,
        });

        if (response.data.valid) {
          setOwnedCoins(response.data.numberOfCoins.toFixed(8));
        } else {
          setOwnedCoins(null);
          console.log("No coins owned for this type");
        }
      } catch (error) {
        console.error("Error fetching number of coins:", error);
      }
    };

    fetchOwnedCoins();
  }, [coinName]);

  useEffect(() => {
    if (chartData) {
      const ctx = document.getElementById("coinChart").getContext("2d");
      new Chart(ctx, {
        type: "line",
        data: chartData,
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: "top",
            },
            tooltip: {
              mode: "index",
              intersect: false,
            },
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: "Date",
              },
            },
            y: {
              display: true,
              title: {
                display: true,
                text: "Price (USD)",
              },
            },
          },
        },
      });
    }
  }, [chartData]);

  const handlePercentageClick = (percentage, actionType) => {
    // Calculate total amount and coins
    const totalAmount = (walletBalance * percentage) / 100;
    const coins = totalAmount / parseFloat(currentPrice);

    // Update state based on actionType
    if (actionType === "buy") {
      if (totalAmount > walletBalance) {
        setNumberOfCoins("");
        setTotalPurchasePrice(0);
        alert("Insufficient balance to make this purchase.");
      } else {
        setNumberOfCoins(coins.toFixed(8)); // Convert to string with fixed decimals
        setTotalPurchasePrice(parseFloat(totalAmount.toFixed(2))); // Convert to number with fixed decimals
      }
    } else if (actionType === "sell") {
      if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
        setNumberOfCoins("");
        setTotalPurchasePrice(0);
        alert("You do not own any coins to sell.");
        return;
      }
      // Calculate coins based on percentage of ownedCoins
      const coinsToSell = (parseFloat(ownedCoins) * percentage) / 100;
      setNumberOfCoins(coinsToSell.toFixed(8)); // Convert to string with fixed decimals
      const totalPrice = parseFloat(currentPrice) * coinsToSell;
      setTotalPurchasePrice(parseFloat(totalPrice.toFixed(2))); // Convert to number with fixed decimals
    }
  };

  const handleChange = (e) => {
    const coins = e.target.value;
    const totalPrice = parseFloat(currentPrice) * parseFloat(coins);

    // Update state
    if (totalPrice > walletBalance) {
      setNumberOfCoins("");
      setTotalPurchasePrice(0);
      alert("Insufficient balance to make this purchase.");
    } else {
      setNumberOfCoins(coins);
      setTotalPurchasePrice(totalPrice); // Ensure totalPurchasePrice is a number
    }
  };

  const handleBuy = async (e) => {
    e.preventDefault();
    const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

    // Check if user has enough balance to make the purchase
    if (totalPrice > walletBalance) {
      alert("Insufficient balance to make this purchase.");
      return;
    }

    try {
      // Get user_key from localStorage
      const user_key = localStorage.getItem("user_key");
      if (!user_key) {
        throw new Error("User key not found in localStorage");
      }

      let baseURL = "";
      if (process.env.NODE_ENV === "development") {
        // If in development environment, use local IP
        baseURL = "http://121.139.20.242:5011";
      }

      // Make API call to complete the purchase
      const response = await axios.post(`${baseURL}/api/buy_coins`, {
        user_key,
        coinName,
        numberOfCoins: parseFloat(numberOfCoins),
        totalPrice,
      });

      if (response.data.success) {
        alert("Purchase successful!");
        setWalletBalance(walletBalance - totalPrice);
        setNumberOfCoins("");
        setTotalPurchasePrice(0);
        window.location.reload();
      } else {
        alert("Purchase failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during purchase:", error);
      alert("An error occurred during purchase. Please try again.");
    }
  };

  const handleSell = async (e) => {
    e.preventDefault();

    try {
      // Get user_key from localStorage
      const user_key = localStorage.getItem("user_key");
      if (!user_key) {
        throw new Error("User key not found in localStorage");
      }

      let baseURL = "";
      if (process.env.NODE_ENV === "development") {
        // If in development environment, use local IP
        baseURL = "http://121.139.20.242:5011";
      }

      // Make API call to get the number of coins owned (already handled in useEffect)
      if (ownedCoins === null || parseFloat(ownedCoins) === 0) {
        setNumberOfCoins("");
        alert("You do not own any coins of this type.");
        return;
      }

      // Proceed with sell logic using numberOfCoins state
      const totalPrice = parseFloat(currentPrice) * parseFloat(numberOfCoins);

      // Check if user has enough coins to make the sale
      if (parseFloat(numberOfCoins) > parseFloat(ownedCoins)) {
        alert("You do not have enough coins to sell this amount.");
        return;
      }

      // Make API call to complete the sale
      const response = await axios.post(`${baseURL}/api/sell_coins`, {
        user_key,
        coinName,
        numberOfCoins: parseFloat(numberOfCoins),
        totalPrice,
      });

      if (response.data.success) {
        alert("Sale successful!");
        setWalletBalance(walletBalance + totalPrice);
        setNumberOfCoins("");
        setTotalPurchasePrice(0);
        window.location.reload();
      } else {
        alert("Sale failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during sale:", error);
      alert("An error occurred during sale. Please try again.");
    }
  };

  const toggleBuyForm = () => {
    setShowBuyForm(!showBuyForm);
    setShowSellForm(false); // Hide sell form when toggling buy form
  };

  const toggleSellForm = () => {
    setShowSellForm(!showSellForm);
    setShowBuyForm(false); // Hide buy form when toggling sell form
  };

  return (
    <div>
      <h2>Price Chart</h2>
      <div>
        <canvas id="coinChart" width={600} height={400}></canvas>
      </div>
      <div>
        <button onClick={toggleBuyForm}>매수</button>
        <button onClick={toggleSellForm}>매도</button>
      </div>
      {showBuyForm && (
        <>
          <h2>매수 : {coinName}</h2>
          <p>코인 가격: ${currentPrice}</p>
          <p>보유 금액: ${walletBalance}</p>
          <form onSubmit={handleBuy}>
            <label>
              갯수를 입력하세요.:
              <input
                type="text"
                value={numberOfCoins}
                onChange={handleChange}
              />
            </label>
            <br />
            <button
              type="button"
              onClick={() => handlePercentageClick(10, "buy")}
            >
              10% Buy
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(25, "buy")}
            >
              25% Buy
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(50, "buy")}
            >
              50% Buy
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(75, "buy")}
            >
              75% Buy
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(100, "buy")}
            >
              100% Buy
            </button>
            <br />
            <p>
              총 금액: $
              {typeof totalPurchasePrice === "number"
                ? totalPurchasePrice.toFixed(2)
                : "0.00"}
            </p>
            {/* Display totalPurchasePrice */}
            <br />
            <button type="submit">매수</button>
          </form>
        </>
      )}
      {showSellForm && (
        <>
          <h2>매도 : {coinName}</h2>
          <p>코인 가격: ${currentPrice}</p>
          <p>보유 코인: {ownedCoins ? ownedCoins : "0"}</p>
          <form onSubmit={handleSell}>
            <label>
              갯수를 입력하세요.:
              <input
                type="text"
                value={numberOfCoins}
                onChange={handleChange}
              />
            </label>
            <br />
            <button
              type="button"
              onClick={() => handlePercentageClick(10, "sell")}
            >
              10% Sell
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(25, "sell")}
            >
              25% Sell
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(50, "sell")}
            >
              50% Sell
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(75, "sell")}
            >
              75% Sell
            </button>
            <button
              type="button"
              onClick={() => handlePercentageClick(100, "sell")}
            >
              100% Sell
            </button>
            <br />
            <p>
              총 금액: $
              {typeof totalPurchasePrice === "number"
                ? totalPurchasePrice.toFixed(2)
                : "0.00"}
            </p>
            {/* Display totalPurchasePrice */}
            <br />
            <button type="submit">매도</button>
          </form>
        </>
      )}
    </div>
  );
}
