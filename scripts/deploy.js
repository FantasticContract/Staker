const hre = require("hardhat");

async function main() {
    const ExampleExternalContract = await hre.ethers.getContractFactory("ExampleExternalContract");
    const exampleExternalContract = await ExampleExternalContract.deploy();
    await exampleExternalContract.deployed();
    console.log("ExampleExternalContract deployed to:", exampleExternalContract.address);

    const Staker = await hre.ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(exampleExternalContract.address);
    await staker.deployed();
    console.log("Staker deployed to:", staker.address);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });