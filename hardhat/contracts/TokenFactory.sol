pragma solidity ^0.8.28;
// SPDX-License-Identifier: UNLICENSED

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MyToken is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {}

    // 给自己 mint 一些测试代币
    function mint(uint256 amount) external {
        _mint(msg.sender, amount * 10 ** decimals());
    }
}

contract TokenFactory{
    address[] public tokens;
    function createToken(string memory name, string memory symbol) external {
        MyToken token = new MyToken(name, symbol);
        tokens.push(address(token));
    }
    function getTokens() external view returns(address[] memory){
        return tokens;
    }
}