const hre = require("hardhat");
const fs = require('fs');

async function main() {
    const ExampleExternalContract = await hre.ethers.getContractFactory("ExampleExternalContract");
    const exampleExternalContract = await ExampleExternalContract.deploy();
    await exampleExternalContract.deployed();
    console.log("ExampleExternalContract deployed to:", exampleExternalContract.address);

    const Staker = await hre.ethers.getContractFactory("Staker");
    const staker = await Staker.deploy(exampleExternalContract.address);
    await staker.deployed();
    console.log("Staker deployed to:", staker.address);

    /* this code writes the contract addresses to a local */
    /* file named config.js that we can use in the app */
    fs.writeFileSync('./config.js', `
    export const exampleExternalContract = "${exampleExternalContract.address}"
    export const staker = "${staker.address}"
    export const ownerAddress = "${staker.signer.address}"
    `);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });