/* IMPORT NODE MODULES
================================================== */
import { ethers } from "hardhat";

/* IMPORT TYPES
================================================== */
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import type { AddressLike, BigNumberish } from "ethers";
import type { SecureHealthRecords } from "@typechain/index";

/* CONSTANTS, TYPES AND UTILS
================================================== */
export type SecureHealthRecordsArgs = {
    adminAddress: AddressLike;
    proofOfIdentityAddress: AddressLike;
};

/* TEST DEPLOY
================================================== */
/**
 * Creates a new instances of SecureHealthRecordsTest
 * @class   SecureHealthRecordsTest
 */
export class SecureHealthRecordsTest {
    /* Vars
    ======================================== */
    private _isInitialized: boolean;

    private _foundation!: HardhatEthersSigner;
    private _foundationAddress!: string;

    private _accounts!: HardhatEthersSigner[];
    private _accountAddresses!: string[];

    private _secureHealthRecordsContract!: SecureHealthRecords;
    private _secureHealthRecordsContractAddress!: string;
    private _secureHealthRecordsArgs!: SecureHealthRecordsArgs;

    /* Init
    ======================================== */
    /**
     * Private constructor due to requirement for async init work.
     *
     * @constructor
     * @private
     */
    private constructor() {
        this._accounts = [];
        this._accountAddresses = [];

        this._isInitialized = false;
    }

    /**
     * Initializes `SecureHealthRecordsTest`. `isInitialized` will return false until
     * this is run.
     *
     * # Error
     *
     * Will throw if any of the deployments are not successful
     *
     * @private
     * @async
     * @method  init
     * @param   {AddressLike} poiAddress
     * @returns {Promise<SecureHealthRecordsTest>} - Promise that resolves to the `SecureHealthRecordsTest`
     * @throws
     */
    private async init(poiAddress: AddressLike): Promise<SecureHealthRecordsTest> {
        // Accounts
        const [foundation, ...rest] = await ethers.getSigners();

        this._foundation = foundation;
        this._foundationAddress = await foundation.getAddress();

        for (let i = 0; i < rest.length; ++i) {
            this._accounts.push(rest[i]);
            this._accountAddresses.push(await rest[i].getAddress());
        }

        // Secure Health Records
        this._secureHealthRecordsArgs = {
            adminAddress: this._foundationAddress,
            proofOfIdentityAddress: poiAddress
        };

        this._secureHealthRecordsContract = await this.deploySecureHealthRecords(
            this._secureHealthRecordsArgs
        );

        this._secureHealthRecordsContractAddress =
            await this._secureHealthRecordsContract.getAddress();

        this._isInitialized = true;

        return this;
    }

    /**
     * Static method to create a new instance of `SecureHealthRecordsTest`, runs required
     * init and returns the instance.
     *
     * @public
     * @static
     * @async
     * @method  create
     * @param   {AddressLike} poiAddress
     * @returns {Promise<SecureHealthRecordsTest>} - Promise that resolves to `SecureHealthRecordsTest`
     */
    public static async create(
        poiAddress: AddressLike
    ): Promise<SecureHealthRecordsTest> {
        const instance = new SecureHealthRecordsTest();
        return await instance.init(poiAddress);
    }

    /* Test Contract Deployers
    ======================================== */
    /**
     * @method   deploySecureHealthRecords
     * @async
     * @public
     * @returns {Promise<SecureHealthRecords>}
     */
    public async deploySecureHealthRecords(
        args: SecureHealthRecordsArgs
    ): Promise<SecureHealthRecords> {
        const f = await ethers.getContractFactory("SecureHealthRecords");
        const c = await f.deploy(
            args.adminAddress,
            args.proofOfIdentityAddress
        );

        return await c.waitForDeployment();
    }

    /* Getters
    ================================================== */
    /**
     * @method      foundation
     * @returns     {HardhatEthersSigner}
     * @throws
     */
    public get foundation(): HardhatEthersSigner {
        this.validateInitialized("foundation");
        return this._foundation;
    }

    /**
     * @method      foundationAddress
     * @returns     {string}
     * @throws
     */
    public get foundationAddress(): string {
        this.validateInitialized("foundationAddress");
        return this._foundationAddress;
    }

    /**
     * @method      accounts
     * @returns     {HardhatEthersSigner[]}
     * @throws
     */
    public get accounts(): HardhatEthersSigner[] {
        this.validateInitialized("accounts");
        return this._accounts;
    }

    /**
     * @method      accountAddresses
     * @returns     {string[]}
     * @throws
     */
    public get accountAddresses(): string[] {
        this.validateInitialized("accountAddresses");
        return this._accountAddresses;
    }

    /**
     * @method      secureHealthRecordsContract
     * @returns     {SecureHealthRecords}
     * @throws
     */
    public get secureHealthRecordsContract(): SecureHealthRecords {
        this.validateInitialized("secureHealthRecordsContract");
        return this._secureHealthRecordsContract;
    }

    /**
     * @method      secureHealthRecordsContractAddress
     * @returns     {string}
     * @throws
     */
    public get secureHealthRecordsContractAddress(): string {
        this.validateInitialized("secureHealthRecordsContractAddress");
        return this._secureHealthRecordsContractAddress;
    }

    /**
     * @method      secureHealthRecordsArgs
     * @returns     {SecureHealthRecordsArgs}
     * @throws
     */
    public get secureHealthRecordsArgs(): SecureHealthRecordsArgs {
        this.validateInitialized("secureHealthRecordsArgs");
        return this._secureHealthRecordsArgs;
    }

    /* Helpers
    ================================================== */
    /**
     * Validates if the class instance has been initialized.
     *
     * # Error
     *
     * Will throw an error if the class instance has not been initialized.
     *
     * @private
     * @method     validateInitialized
     * @param      {string}    method
     * @throws
     */
    private validateInitialized(method: string): void {
        if (!this._isInitialized) {
            throw new Error(
                `Deployment not initialized. Call create() before accessing ${method}.`
            );
        }
    }

}
