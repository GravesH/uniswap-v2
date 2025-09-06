const { ethers } = require("hardhat");
const fs = require("fs");
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  //部署WETH9合约
  console.log(
    "Account balance:",
    (await deployer.provider.getBalance(deployer.address)).toString()
  );
  const WETH9 = await ethers.getContractFactory("WETH9");
  const weth9 = await WETH9.deploy();
  await weth9.waitForDeployment();

  console.log("WETH9 address:", weth9.target);

  //部署Factory合约
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapV2Factory = await UniswapV2Factory.deploy(deployer.address);
  await uniswapV2Factory.waitForDeployment();

  console.log("UniswapV2Factory address:", uniswapV2Factory.target);
  //部署Router合约
  const UniswapV2Router02 = await ethers.getContractFactory(
    "UniswapV2Router02"
  );
  const uniswapV2Router02 = await UniswapV2Router02.deploy(
    uniswapV2Factory.target,
    weth9.target
  );
  await uniswapV2Router02.waitForDeployment();

  console.log("UniswapV2Router02 address:", uniswapV2Router02.target);

  //部署MyToken合约
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const factory = await TokenFactory.deploy();
  await factory.waitForDeployment();
  console.log("TokenFactory address:", factory.target);
  //保存地址到文件  方便前端使用
  fs.writeFileSync(
    "waitForDeployment-addresses.json",
    JSON.stringify(
      {
        UNISWAP_V2_FACTORY: uniswapV2Factory.target,
        WETH: weth9.target,
        UNISWAP_V2_ROUTER_02: uniswapV2Router02.target,
        TOKEN_FACTORY: factory.target,
      },
      null,
      2
    )
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
