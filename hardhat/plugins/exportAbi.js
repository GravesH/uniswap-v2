const fs = require("fs");
const path = require("path");

// Hardhat artifacts 目录
const artifactsPath = path.join(__dirname, "../artifacts/contracts");
// ABI 输出目录
const abiDir = path.join(__dirname, "../abi");

// 如果没有 abi 目录，就创建
if (!fs.existsSync(abiDir)) {
  fs.mkdirSync(abiDir);
}

function exportAbis(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      exportAbis(fullPath);
    } else if (file.endsWith(".json") && !file.endsWith(".dbg.json")) {
      const artifact = JSON.parse(fs.readFileSync(fullPath, "utf8"));
      const contractName = path.basename(file, ".json");

      if (artifact.abi) {
        const abiFile = path.join(abiDir, `${contractName}.json`);
        fs.writeFileSync(abiFile, JSON.stringify(artifact.abi, null, 2));
        console.log(`✅ ABI 导出: ${contractName}.json`);
      }
    }
  }
}

// 开始导出
exportAbis(artifactsPath);
