const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

// 读取地址文件
function readAddresses(filePath) {
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  }
  return {};
}

// 写入地址文件
function writeAddresses(filePath, allAddresses) {
  fs.writeFileSync(filePath, JSON.stringify(allAddresses, null, 2));
}

async function main() {
  // 直接用 Hardhat 的 network.name
  const network = hre.network.name;
  const filePath = path.resolve(__dirname, "../waitForDeployment-addresses.json");

  let allAddresses = readAddresses(filePath);

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", await deployer.getAddress());

  const WETH9 = await hre.ethers.getContractFactory("WETH9");
  const weth9 = await WETH9.deploy();
  await weth9.waitForDeployment();
  console.log("WETH9 deployed to:", weth9.target);
  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const uniswapV2Factory = await UniswapV2Factory.deploy(deployer.address);
  await uniswapV2Factory.waitForDeployment();
  console.log("UniswapV2Factory deployed to:", uniswapV2Factory.target);

  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const uniswapV2Router02 = await UniswapV2Router02.deploy(
    uniswapV2Factory.target,
    weth9.target
  );
  await uniswapV2Router02.waitForDeployment();
  console.log("UniswapV2Router02 deployed to:", uniswapV2Router02.target);

  const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
  const uniswapV2Pair = await UniswapV2Pair.deploy();
  await uniswapV2Pair.waitForDeployment();
  console.log("UniswapV2Pair deployed to:", uniswapV2Pair.target);

  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const factory = await TokenFactory.deploy();
  await factory.waitForDeployment();
  console.log("TokenFactory deployed to:", factory.target);
  // 只更新当前网络字段
  allAddresses[network] = {
    UNISWAP_V2_FACTORY: uniswapV2Factory.target,
    WETH: weth9.target,
    UNISWAP_V2_ROUTER_02: uniswapV2Router02.target,
    UNISWAP_V2_PAIR: uniswapV2Pair.target,
    TOKEN_FACTORY: factory.target,
  };

  writeAddresses(filePath, allAddresses);
  console.log(`合约地址已保存到 ${filePath}，网络: ${network}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
