const hre = require("hardhat");

async function main() {

    const amount = hre.ethers.utils.parseEther("0.001");
  
    const escorw = await hre.ethers.deployContract("Escrow", ["0xFdF3929692E27821A12c854edEA21845A55bf2eD", "0xC8eEF3C147908e4fB66D7c250Aa18e038e061041", "Some note"], {
        value: amount,
    });
  
    console.log(
      `Escrow deployed to ${escorw.address}`
    );
  }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });