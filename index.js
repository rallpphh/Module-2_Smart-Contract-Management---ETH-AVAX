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

  const transfer = (amount) => {
    // Add a deposit transaction to simulate the balance increase
    const transaction = {
      hash: `0x${Math.floor(Math.random() * 1e16).toString(16)}`,
      amount: amount,
      action: 'deposit',
      timestamp: new Date().toISOString()
    };
    setTransactions((prevTransactions) => [...prevTransactions, transaction]);
    setNotification(`Transfer of ${amount} ETH successful.`);
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

  async function SendTransaction(amount) {
    const param = {
      from: account,
      to: "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      gas: Number(21000).toString(16),
      gasPrice: Number(2500000).toString(16),
      value: ethers.utils.parseEther(amount).toHexString(), // Convert ETH to Wei
    };

    try {
      await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [param],
      });
      setNotification("Transaction sent successfully.");
    } catch (error) {
      console.error("Error sending transaction:", error);
      setNotification("Error sending transaction. Please try again.");
    }
  }

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
        <button onClick={toggleShowDetails}>{showDetails ? "Hide All" : "Show All"}</button>
        {showDetails && (
          <>
            <p>
              Your Account: {showAccount ? account : "**"}
              <span onClick={toggleShowAccount} style={{ cursor: "pointer", marginLeft: "10px" }}>
                {showAccount ? "👁️" : "👁️‍🗨️"}
              </span>
            </p>
            <div>
              <select value={action} onChange={(e) => setAction(e.target.value)}>
                <option value="deposit">Deposit</option>
                <option value="withdraw">Withdraw</option>
              </select>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`${action === 'deposit' ? 'Deposit' : 'Withdraw'} Amount`}
              />
              <button onClick={handleDepositOrWithdraw}>{action === 'deposit' ? 'Deposit' : 'Withdraw'}</button>
              <button onClick={() => SendTransaction(amount)}>Send Transaction</button> {/* Modify here */}
            </div>
            <button onClick={() => transfer(1000)}>Transfer 1000</button>
            <button onClick={doubleBalance}>Double Balance</button>
            <p>Total Balance: {getTotalBalance()} ETH</p>
            <TransactionHistory transactions={transactions} />
            <button onClick={withdrawAll}>Withdraw All</button>
          </>
        )}
      </div>
    );
  };

  return (
    <main className="container">
      <header>
        <h1 style={{ color: "green" }}>Module 2 Assessment</h1>
        {initUser()}
      </header>
      {notification && <p style={{ color: "red" }}>{notification}</p>}
      <style jsx>{`
        .container {
          text-align: center;
        }
      `}</style>
    </main>
  );
}

const TransactionHistory = ({ transactions }) => {
  return (
    <div>
      <h2>Transaction History</h2>
      <ul>
        {transactions.map((transaction, index) => (
          <li key={index}>
            {transaction.timestamp}: {transaction.action} of {transaction.amount} ETH
          </li>
        ))}
      </ul>
    </div>
  );
};

