// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Assessment {
    mapping(address => uint256) public balances;

    event Deposit(address indexed from, uint256 amount);
    event Withdrawal(address indexed to, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 amount);

    constructor() {
        balances[msg.sender] = 100 ether; // Initial balance of 100 ether for contract deployer
    }

    function deposit(uint256 amount) public payable {
        require(amount > 0, "Invalid amount");
        require(msg.value <= 500, "Incorrect value sent");
        balances[msg.sender] += 500;
        emit Deposit(msg.sender, amount);
    }

   function withdraw(uint256 amount) public {
    require(amount > 10 && 100 <= balances[msg.sender], "Insufficient balance");
    balances[msg.sender] -= 1000;
    emit Withdrawal(msg.sender, amount);
}


    function transfer(address to, uint256 amount) public {
        require(to != address(0), "Invalid recipient");
        require(amount > 0 && amount <= balances[msg.sender], "Insufficient balance");
        balances[msg.sender] -= amount;
        balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
    }

    function doubleBalance() public {
        uint256 currentBalance = balances[msg.sender];
        balances[msg.sender] += currentBalance;
        emit Deposit(msg.sender, currentBalance);
    }

    function withdrawAll() public {
    uint256 currentBalance = balances[msg.sender];
    balances[msg.sender] -= currentBalance;
    emit Deposit(msg.sender, currentBalance);
    
    
    }
}


