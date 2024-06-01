import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [transactions, setTransactions] = useState([]);
  const [showDetails, setShowDetails] = useState(true);
  const [showAccount, setShowAccount] = useState(true);
  const [notification, setNotification] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [pinAttempts, setPinAttempts] = useState(0);
  const [pinWarning, setPinWarning] = useState(false);
  const [timer, setTimer] = useState(0);
  const [hidePin, setHidePin] = useState(false);
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState(""); // New state for recipient address
  const [action, setAction] = useState("deposit"); // Default to deposit

  const contractAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Update with actual address
  const atmABI = atm_abi.abi;

  useEffect(() => {
    const getWallet = async () => {
      if (window.ethereum) {
        setEthWallet(new ethers.providers.Web3Provider(window.ethereum));
      }
    };
    getWallet();
  }, []);

  const handleAccount = async () => {
    if (ethWallet) {
      const accounts = await ethWallet.listAccounts();
      if (accounts.length > 0) {
        console.log("Account connected: ", accounts[0]);
        setAccount(accounts[0]);
        getATMContract();
      } else {
        console.log("No account found");
      }
    }
  };

  const connectAccount = async () => {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      handleAccount();
    } catch (error) {
      console.error("Error connecting account:", error);
    }
  };

  const getATMContract = async () => {
    const network = await ethWallet.getNetwork();
    console.log("Network:", network);
    if (network.chainId === 1337 || network.chainId === 31337) {
      // Localhost or Hardhat network
      const signer = ethWallet.getSigner();
      const atmContract = new ethers.Contract(contractAddress, atmABI, signer);
      setATM(atmContract);
    } else {
      console.error("Unsupported network");
    }
  };

  const handleTransaction = async (amount, action) => {
    if (atm) {
      try {
        const tx = action === "deposit" ? await atm.deposit(amount) : await atm.withdraw(amount);
        await tx.wait();
        setTransactions(prevTransactions => [...prevTransactions, {
          hash: tx.hash,
          amount: parseFloat(amount),
          action,
          timestamp: new Date().toISOString()
        }]);
        setNotification(`${action} successful.`);
      } catch (error) {
        console.error(`${action} error:`, error);
        setNotification(`Error ${action}. Please try again.`);
      }
    }
  };

  const deposit = (amount) => {
    handleTransaction(amount, 'deposit');
  };

  const withdraw = (amount) => {
    handleTransaction(amount, 'withdraw');
  };

  const transfer = async (amount, recipient) => {
    const signer = ethWallet.getSigner();
    try {
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.utils.parseEther(amount),
      });
      await tx.wait();
      setNotification(`Transfer of ${amount} ETH to ${recipient} successful.`);
    } catch (error) {
      console.error("Error transferring ETH:", error);
      setNotification("Error transferring. Please try again.");
    }
  };

  const doubleBalance = () => {
    const currentBalance = getTotalBalance();
    if (currentBalance === 0) {
      setNotification("YOU HAVE 0 BALANCE TO DOUBLE");
    } else if (currentBalance < 10000) {
      setNotification("ONLY 10000 UP CAN DOUBLE");
    } else {
      const doubledBalance = currentBalance * 2;
      setTransactions([]);
      handleTransaction(doubledBalance, 'deposit');
      setNotification("YOU HAVE SUCCESSFULLY DOUBLED YOUR ALLOWANCE");
    }
  };

  const withdrawAll = async () => {
    const totalBalance = getTotalBalance();
    if (totalBalance === 0) {
      setNotification("Total Balance is already 0");
    } else {
      try {
        const tx = await atm.withdraw(totalBalance);
        await tx.wait();
        setTransactions([]);
        setNotification("Withdrawal successful. Transaction history cleared.");
      } catch (error) {
        console.error("Withdrawal error:", error);
        setNotification("Error withdrawing funds. Please try again.");
      }
    }
  };

  const getTotalBalance = () => {
    return transactions.reduce((total, transaction) => {
      if (transaction.action === 'deposit') {
        return total + transaction.amount;
      } else if (transaction.action === 'withdraw') {
        return total - transaction.amount;
      } else {
        return total;
      }
    }, 0);
  };

  const toggleShowDetails = () => {
    setShowDetails((prevShowDetails) => !prevShowDetails);
  };

  const toggleShowAccount = () => {
    setShowAccount((prevShowAccount) => !prevShowAccount);
  };

  const handleLogin = () => {
    // Simulated login process, replace with actual authentication logic
    if (username === "Ralph ntc" && pin === "123456") {
      setLoggedIn(true);
      setPinAttempts(0); // Reset pin attempts on successful login
      setTransactions([]); // Reset transactions on login
      handleAccount(); // Connect account after successful login
    } else {
      setPinAttempts(pinAttempts + 1);
      if (pinAttempts >= 2) {
        setPinWarning(true);
        setTimer(10);
        const interval = setInterval(() => {
          setTimer((prevTimer) => prevTimer - 1);
        }, 1000);
        setTimeout(() => {
          clearInterval(interval);
          setPinAttempts(0);
          setPinWarning(false);
          setNotification("");
        }, 10000);
      }
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setAccount(undefined);
    setTransactions([]);
  };

  const handlePinChange = (e) => {
    setPin(e.target.value);
  };

  const togglePinVisibility = () => {
    setHidePin((prevHidePin) => !prevHidePin);
  };

  const handleDepositOrWithdraw = () => {
    if (action === 'deposit') {
      deposit(parseFloat(amount));
    } else {
      withdraw(parseFloat(amount));
    }
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask in order to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Connect wallet</button>;
    }

    if (!loggedIn) {
      return (
        <div>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
          <input type={hidePin ? "password" : "text"} value={pin} onChange={handlePinChange} placeholder="PIN" />
          <button onClick={handleLogin} disabled={pinWarning}>
            {pinWarning ? `Please wait ${timer} seconds before retrying.` : "Login"}
          </button>
          <button onClick={togglePinVisibility}>{hidePin ? "Show PIN" : "Hide PIN"}</button>
          {notification && <p style={{ color: "red" }}>{notification}</p>}
        </div>
      );
    }

    return (
      <div>
        <button onClick={handleLogout}>Log Out</button>
        {pinWarning && <p>Please wait {timer} seconds before retrying.</p>}
        <button onClick={toggleShowDetails}>{showDetails ? "Hide Balance" : "Show Balance"}</button>
        {showDetails && (
          <div>
            <h1>Balance: {getTotalBalance()} ETH</h1>
            <h1 style={{ color: "red" }}>{notification}</h1>
          </div>
        )}
        <button onClick={toggleShowAccount}>{showAccount ? "Hide Account" : "Show Account"}</button>
        {showAccount && (
          <div>
            <h3>Account: {account}</h3>
          </div>
        )}
        <div>
          <label>
            Action:
            <select value={action} onChange={(e) => setAction(e.target.value)}>
              <option value="deposit">Deposit</option>
              <option value="withdraw">Withdraw</option>
            </select>
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
          />
          <button onClick={handleDepositOrWithdraw}>
            {action.charAt(0).toUpperCase() + action.slice(1)}
          </button>
        </div>
        <div>
          <h3>Transfer Funds</h3>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="Recipient Address"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount in ETH"
          />
          <button onClick={() => transfer(amount, recipient)}>Send Transaction</button>
        </div>
        <div>
          <h3>Transaction History</h3>
          <ul>
            {transactions.map((tx, index) => (
              <li key={index}>
                {tx.action} {tx.amount} ETH (Hash: {tx.hash})
              </li>
            ))}
          </ul>
        </div>
        <button onClick={doubleBalance}>Double Balance</button>
        <button onClick={withdrawAll}>Withdraw All Funds</button>
      </div>
    );
  };

  return (
    <main className="container">
       <h1 style={{ color: "green" }}> Module 2 Assessment ATM APP!</h1>
      {initUser()}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          text-align: center;
          background-color: #f8f9fa;
          color: #343a40;
        }

        button {
          margin: 10px;
          padding: 10px 20px;
          background-color: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        button:hover {
          background-color: #0056b3;
        }

        input {
          margin: 10px;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 5px;
        }

        select {
          margin: 10px;
          padding: 10px;
          border: 1px solid #ced4da;
          border-radius: 5px;
        }

        header {
          margin-bottom: 20px;
        }
      `}</style>
    </main>
  );
}
