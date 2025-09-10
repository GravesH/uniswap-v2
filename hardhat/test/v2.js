const { expect } = require("chai");
const hre = require("hardhat");
const {
  keccak256,
  getCreate2Address,
  zeroPadValue,
  concat,
} = require("ethers");

describe("UniswapV2 local test with Router", function () {
  let factory, router, weth, tokenA, tokenB, owner, addr1;

  before(async function () {
    [owner, addr1] = await hre.ethers.getSigners();

    // 1. 部署 Factory
    const Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
    factory = await Factory.deploy(owner.address);
    await factory.waitForDeployment();

    // 2. 部署 WETH
    const WETH = await hre.ethers.getContractFactory("WETH9");
    weth = await WETH.deploy();
    await weth.waitForDeployment();

    // 3. 部署 Router
    const Router = await hre.ethers.getContractFactory("UniswapV2Router02");
    router = await Router.deploy(factory.target, weth.target);
    await router.waitForDeployment();

    // 4. 部署两个测试代币
    const Token = await hre.ethers.getContractFactory("Token");
    tokenA = await Token.deploy(
      "TokenA",
      "TKA",
      hre.ethers.parseUnits("1000000", 18)
    );
    tokenB = await Token.deploy(
      "TokenB",
      "TKB",
      hre.ethers.parseUnits("1000000", 18)
    );
    await tokenA.waitForDeployment();
    await tokenB.waitForDeployment();
  });

  it("should create a pair and verify deployed code", async function () {
    await factory.createPair(tokenA.target, tokenB.target);
    const pairAddress = await factory.getPair(tokenA.target, tokenB.target);
    const code = await hre.ethers.provider.getCode(pairAddress);
    console.log("Pair address:", pairAddress, "code length:", code.length);
    expect(code.length).to.be.gt(2);
  });

  it("should print Pair creationCode and hash", async function () {
    const Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
    console.log("Pair creationCode:", Pair.bytecode);
    console.log("JS hash:", keccak256(Pair.bytecode));
  });

  it("should add liquidity via Router", async function () {
    const amountA = hre.ethers.parseUnits("1000", 18);
    const amountB = hre.ethers.parseUnits("2000", 18);

    await tokenA.approve(router.target, amountA);
    await tokenB.approve(router.target, amountB);

    const allowanceA = await tokenA.allowance(owner.address, router.target);
    const allowanceB = await tokenB.allowance(owner.address, router.target);
    expect(allowanceA).to.equal(amountA);
    expect(allowanceB).to.equal(amountB);

    // addLiquidity 前先检查 pair
    let pairAddress = await factory.getPair(tokenA.target, tokenB.target);
    const codeBefore = await hre.ethers.provider.getCode(pairAddress);
    expect(codeBefore.length).to.be.gt(2);

    const tx = await router.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      0,
      0,
      owner.address,
      Math.floor(Date.now() / 1000) + 60 * 10
    );
    await tx.wait();

    // 检查 LP token
    const Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
    const pair = Pair.attach(pairAddress);
    const lpBalance = await pair.balanceOf(owner.address);
    console.log("LP token balance of owner:", lpBalance.toString());
    expect(lpBalance).to.be.gt(0n);
  });
});
