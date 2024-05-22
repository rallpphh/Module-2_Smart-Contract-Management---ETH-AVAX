# Module-2_Smart-Contract-Management---ETH-AVAX

This is the culmination of module 2 of ETH + AVAX Assessment given the circumstances of Smart Contracts and its functionalities.

# Overview/Description
The Metamask Assessment involves using ETH and making deposits. By utilizing Gipod and Localhost, we successfully managed ETH transactions and executed them via Gitpod, allowing them to run in a browser. Tools like npm and npx were essential in integrating Metamask, facilitating both front-end and back-end operations seamlessly.

# Funtions

Install MetaMask Extension:
Access localhost:3000 in your browser.
Install MetaMask as a browser extension.
Ensure you are connected to your MetaMask account.

Connect to Hardhat Node:
If there is an error or you are not connected to an account, open a terminal and start a Hardhat node by running:
Copy code
npx hardhat node
Get the first private key provided by the Hardhat node.
Import this private key into MetaMask. This will give you an account with 10,000 ETH.

Configure MetaMask on Localhost:
Access localhost:3000 again.
When prompted to choose a wallet, select MetaMask instead of Phantom.
Note that there might be a delay in the process, but it should work eventually.

Deposit ETH:
Once MetaMask is connected to the localhost application, proceed to deposit ETH.
Confirm the transaction in MetaMask.
After confirmation, you should be ready to proceed.

# Starter Next/Hardhat Project

After running the gitpod, you will want to do the following to get the code running on your computer.
1. Inside the project directory, in the terminal type: npm i
2. Open two additional terminals in your VS code
3. In the second terminal type: npx hardhat node
4. In the third terminal, type: npx hardhat run --network localhost scripts/deploy.js
5. Back in the first terminal, type npm run dev to launch the front-end.

After this, the project will be running on your localhost. 
Typically at http://localhost:3000/

# Author
Ralph Lauren P. Bensurto



