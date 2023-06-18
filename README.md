# Staking project

This project demonstrates a basic Staking contract with interest accrual and deposit/withdraw functionality. It comes with a sample contract, a test for that contract, and a script that deploys that contract.

- You will be able to deposit and withdraw from the Staker Contract.
  - Staking is a single-use action, meaning once we stake we cannot re-stake again
  - Withdraws from the contract removes the entire principal balance and any accrued interest
- The Staker contract has an interest payout rate of `uint256 public constant rewardRatePerSecond = 0.0001 ether` for every second that the deposited ETH is eligible for interest accrument
- Upon contract deployment, the Staker contract should begin with 2 timestamp counters. The first deadline should be set to 180 seconds and the second set to 600 seconds
  ```
  uint256 public withdrawalDeadline = currentBlockTime + 180 seconds;
  uint256 public claimDeadline = currentBlockTime + 600 seconds;
  ```
- The 180 seconds deadline dictates the period in which the staking user is able to deposit funds. (Between t=0 seconds and t=180 seconds, the staking user can deposit)
- All blocks that take place between the deposit of funds to the 180 seconds deadline are valid for interest accrual
- After the 180 seconds withdrawal deadline has passed, the staking user is able to withdraw the entire principal balance and any accrued interest until the 600 seconds deadline hits
- After the additional 180 seconds window for withdraws has passed, the user is blocked from withdrawing their funds since they timed out.

Try running some of the following tasks:

```shell
npx hardhat test
npx hardhat run scripts/deploy.js
```

## Deployed contract on Sepolia
https://sepolia.etherscan.io/address/0x032aeace7a561f7a0019e65525a4bf5f1dc18ae9#code
