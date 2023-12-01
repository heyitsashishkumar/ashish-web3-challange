import { type HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-solhint";
import "hardhat-contract-sizer";
import "@openzeppelin/hardhat-upgrades";
import "solidity-docgen";

import "tsconfig-paths/register";

import "./tasks";

/**
 * I have changed the solidity version to 0.8.13 because of the following error:
 *  - Error HH502: Couldn't download compiler version list. Please check your internet connection and try again.
 * Please change it back to 0.8.19 if you see the above error on your side. Thanks.
 **/

// See, in general, https://hardhat.org/hardhat-runner/docs/config#configuration
const config: HardhatUserConfig = {
    solidity: {
        compilers: [
            {
                version: "0.8.19",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
    },
    mocha: {
        timeout: 40_000,
    },
    contractSizer: {
        // see: https://github.com/ItsNickBarry/hardhat-contract-sizer
        alphaSort: false,
        disambiguatePaths: false,
        runOnCompile: true,
        strict: true,
    },
    docgen: {
        // see: https://github.com/OpenZeppelin/solidity-docgen#readme
        outputDir: "./docs",
        pages: "files",
        exclude: [
            "test",
            "proof-of-identity/test",
            "proof-of-identity/examples",
            "proof-of-identity/interfaces/vendor",
        ],
    },
};

export default config;
