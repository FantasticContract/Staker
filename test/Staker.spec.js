const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Staker", () => {

  async function deployExampleExternalContractFixture() {
    const [owner] = await ethers.getSigners();

    const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
    const exampleExternalContract = await ExampleExternalContract.deploy();

    return { exampleExternalContract, owner };
  }

  async function deployStakerFixture() {
    const [owner, account1, account2] = await ethers.getSigners();

    const ExampleExternalContract = await ethers.getContractFactory("ExampleExternalContract");
    const exampleExternalContract = await ExampleExternalContract.deploy();

    const Staker = await ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(exampleExternalContract.address);

    return { staker, owner, account1, account2, exampleExternalContract };
  }

  describe("Deployment", () => {
    it("Should deploy ExampleExternalContract and set the completed to false", async () => {
      const { exampleExternalContract } = await loadFixture(deployExampleExternalContractFixture);
      expect(await exampleExternalContract.completed()).to.equal(false);
    });

    it("Should deploy Staker", async () => {
      const { staker, exampleExternalContract } = await loadFixture(deployStakerFixture);
      expect(await staker.exampleExternalContract()).to.equal(exampleExternalContract.address);
    });
  });

  describe("Stake", () => {
    it("balance goes up", async () => {
      const { staker, account1 } = await loadFixture(deployStakerFixture);

      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther("0")
      );

      await staker.connect(account1).stake({value: ethers.utils.parseEther("0.12")});
      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther("0.12")
      );
    });
  });

  describe("Withdraw", () => {
    
    it("should fail if the withdrawal period is not reached yet", async () => {
      const { staker, account2 } = await loadFixture(deployStakerFixture);

      await expect(staker.connect(account2).withdraw()).to.be.revertedWith('Withdrawal period is not reached yet');
    });

    it("should fail if the user has no balance to withdraw", async () => {
      const { staker, account1, account2 } = await loadFixture(deployStakerFixture);

      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther("0")
      );
      
      await staker.connect(account1).stake({value: ethers.utils.parseEther("0.12")});
      await time.increaseTo(await staker.withdrawalDeadline());
      await expect(staker.connect(account2).withdraw()).to.be.revertedWith('You have no balance to withdraw!');
    });

    it("should withdraw and have the correct user balance", async () => {
      const { staker, account1, account2 } = await loadFixture(deployStakerFixture);

      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther("0")
      );
      
      await staker.connect(account1).stake({value: ethers.utils.parseEther("0.12")});

      await account2.sendTransaction({
        to: staker.address,
        value: ethers.utils.parseEther("10")
      });

      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther("10.12")
      );

      const balance0 = await ethers.provider.getBalance(account1.address);

      await time.increaseTo(await staker.withdrawalDeadline());
      await staker.connect(account1).withdraw();

      const balance = await ethers.provider.getBalance(account1.address);
    });
  });

  describe("Execute", () => {
    it("fails if the claim deadline is not reached", async () => {
      const { staker } = await loadFixture(deployStakerFixture);

      await expect(staker.execute()).to.be.revertedWith('Claim deadline is not reached yet');
    });

    it("send the correct eth and complete the exampleExternalContract", async () => {
      const { staker, account1, account2, exampleExternalContract } = await loadFixture(deployStakerFixture);

      await staker.connect(account1).stake({value: ethers.utils.parseEther("11.12")});

      await time.increaseTo(await staker.claimDeadline());
      expect(await exampleExternalContract.completed()).to.equal(false);
      await staker.execute();

      expect(await ethers.provider.getBalance(staker.address)).to.equal(
        ethers.utils.parseEther('0')
      );

      expect(await ethers.provider.getBalance(exampleExternalContract.address)).to.equal(
        ethers.utils.parseEther('11.12')
      );

      expect(await exampleExternalContract.completed()).to.equal(true);
    });
  });

  describe("Reset time for the test/demo purpose", () => {
    it("Is post deadline then reset the time, so it can withdraw correctly for the demo", async () => {
      const { staker, account1, account2, exampleExternalContract } = await loadFixture(deployStakerFixture);
      await account2.sendTransaction({
        to: staker.address,
        value: ethers.utils.parseEther("10")
      });

      await staker.connect(account1).stake({value: ethers.utils.parseEther("11.12")});

      await time.increaseTo(await staker.claimDeadline());
      expect(await exampleExternalContract.completed()).to.equal(false);

      await expect(staker.connect(account1).withdraw()).to.be.revertedWith('Claim deadline has been reached');

      await staker.resetTime();

      await expect(staker.connect(account1).withdraw()).to.be.revertedWith('Withdrawal period is not reached yet');

      await time.increaseTo(await staker.withdrawalDeadline());
      await staker.connect(account1).withdraw();

      expect(await ethers.provider.getBalance(account1.address))
        .to.greaterThan(ethers.utils.parseEther("10"));
    });
  });
});