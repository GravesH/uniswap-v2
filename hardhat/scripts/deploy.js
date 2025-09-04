import { ethers } from "ethers";
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(
    "Deploying the contracts with the account:",
    await deployer.getAddress()
  );
  //部署WETH9合约
  console.log("Account balance:", (await deployer.getBalance()).toString());
  const WETH9 = await ethers.getContractFactory("WETH9");
  const weth9 = await WETH9.deploy();
  await weth9.deployed();

  console.log("WETH9 address:", weth9.address);

  //部署Factory合约
  const UniswapV2Factory = await ethers.getContractFactory("UniswapV2Factory");
  const uniswapV2Factory = await UniswapV2Factory.deploy(deployer.address);
  await uniswapV2Factory.deployed();

  console.log("UniswapV2Factory address:", uniswapV2Factory.address);
  //部署Router合约
  const UniswapV2Router02 = await ethers.getContractFactory(
    "UniswapV2Router02"
  );
  const uniswapV2Router02 = await UniswapV2Router02.deploy(
    uniswapV2Factory.address,
    weth9.address
  );
  await uniswapV2Router02.deployed();

  console.log("UniswapV2Router02 address:", uniswapV2Router02.address);

  //保存地址到文件  方便前端使用
  const fs = require("fs");
  fs.writeFileSync(
    "deployed-addresses.json",
    JSON.stringify(
      {
        UNISWAP_V2_FACTORY: uniswapV2Factory.address,
        WETH: weth9.address,
        UNISWAP_V2_ROUTER_02: uniswapV2Router02.address,
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
