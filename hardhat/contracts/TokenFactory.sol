pragma solidity ^0.8.28;
// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // 给自己 mint 一些测试代币
    function mint(address to,uint256 amount) external {
        _mint(to, amount * 10 ** decimals());
    }
}

contract TokenFactory {
    address[] public tokens;
      event TokenCreated(address token, string name, string symbol, uint256 amount);
    struct tokenInfo {
        string name;
        string symbol;
    }
    mapping(address => tokenInfo) public tokenInfos;
    function createToken(
        string memory name,
        string memory symbol,
        uint256 amount
    ) external {
        MyToken token = new MyToken(name, symbol);
        token.mint(msg.sender, amount);
        tokenInfos[address(token)] = tokenInfo(name, symbol);
        tokens.push(address(token));
         emit TokenCreated(address(token), name, symbol, amount);
    }
    function getAllTokens() external view returns (address[] memory) {
        return tokens;
    }
}
