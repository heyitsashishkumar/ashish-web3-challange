/* IMPORT NODE MODULES
================================================== */
import {
    loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

/* IMPORT CONSTANTS AND UTILS
================================================== */
import { ProofOfIdTest, randIdArgs } from "../../setup";
import { SecureHealthRecordsTest } from "./setup";
import { ZERO_ADDRESS } from "../../../constants";
import { addTime } from "@utils/time";

/* TESTS
================================================== */
describe("Secure Health Records", function () {
    /* Setup
    ======================================== */
    const exp = BigInt(addTime(Date.now(), 2, "months", "sec"));

    async function setup() {
        const poi = await ProofOfIdTest.create();
        const shr = await SecureHealthRecordsTest.create(
            poi.proofOfIdContractAddress
        );

        return { poi, shr };
    }

    /* Deployment and Initialization
    ======================================== */
    describe("Deployment and Initialization", function () {
        it("Should have a deployment address", async function () {
            const { shr } = await loadFixture(setup);

            expect(shr.secureHealthRecordsContractAddress).to.have.length(42);
            expect(shr.secureHealthRecordsContractAddress).to.not.equal(ZERO_ADDRESS);
        });
    });

    /* Health Record Management
    ======================================== */
    describe("Health Record Management", function () {
        it("Should allow a patient to add a health record", async function () {
            const { poi, shr } = await loadFixture(setup);

            const c = shr.secureHealthRecordsContract.connect(shr.accounts[0]);

            const patient = shr.accountAddresses[0];
            // console.log("Patient: ", patient);

            const args = randIdArgs(patient);
            // console.log("Args: ", args);

            const healthRecordData = "Patient Health Data";

            await poi.issueIdentity(args);
            console.log("Identity issued");


            const txRes = await c.addHealthRecord(1, healthRecordData);
            await txRes.wait();
            // console.log("Health record added");

            const storedRecord = await c.getHealthRecord(1);
            // console.log("Stored record: ", storedRecord);

            expect(storedRecord).to.equal(healthRecordData);
        });

        it("Should not allow unauthorized accounts to add health records", async function () {
            const { poi, shr } = await loadFixture(setup);

            const healthRecordData = "Unauthorized Health Data";

            // Attempt to add a health record by an unauthorized user
            await expect(
                shr.secureHealthRecordsContract.connect(shr.accounts[1]).addHealthRecord(1, healthRecordData)
            ).to.be.reverted; // Specify the expected error message or custom error
        });


        it("Should allow a patient to grant access to another account", async function () {
            const { poi, shr } = await loadFixture(setup);
            const c = shr.secureHealthRecordsContract.connect(shr.accounts[0]);

            const patient = shr.accountAddresses[0];
            const grantee = shr.accountAddresses[1];

            await poi.issueIdentity(randIdArgs(patient));

            // Grant access to the grantee
            const txRes = await c.grantAccess(1, grantee);
            await txRes.wait();

            // Check if grantee now has access
            expect(await shr.secureHealthRecordsContract.isAuthorized(grantee, 1)).to.be.true;
        });

        it("Should not allow unauthorized accounts to grant access", async function () {
            const { poi, shr } = await loadFixture(setup);
            const patient = shr.accountAddresses[0];
            const unauthorizedUser = shr.accountAddresses[1];
            const grantee = shr.accountAddresses[2];

            await poi.issueIdentity(randIdArgs(patient));

            // Attempt to grant access by an unauthorized user
            await expect(
                shr.secureHealthRecordsContract.connect(shr.accounts[1]).grantAccess(patient, grantee)
            ).to.be.reverted; // Specify the expected error message or custom error
        });

        it("Should allow a patient to revoke access from another account", async function () {
            const { poi, shr } = await loadFixture(setup);
            const c = shr.secureHealthRecordsContract.connect(shr.accounts[0]);

            const patient = shr.accountAddresses[0];
            const grantee = shr.accountAddresses[1];

            await poi.issueIdentity(randIdArgs(patient));
            await c.grantAccess(1, grantee);

            // Revoke access from the grantee
            const txRes = await c.revokeAccess(1, grantee);
            await txRes.wait();

            // Check if grantee now has access revoked
            expect(await shr.secureHealthRecordsContract.isAuthorized(grantee, patient)).to.be.false;
        });

        it("Should not allow unauthorized accounts to revoke access", async function () {
            const { poi, shr } = await loadFixture(setup);
            const c = shr.secureHealthRecordsContract.connect(shr.accounts[0]);

            const patient = shr.accountAddresses[0];
            const unauthorizedUser = shr.accountAddresses[1];
            const grantee = shr.accountAddresses[2];
            
            await poi.issueIdentity(randIdArgs(patient));
            await c.grantAccess(1, grantee);

            // Attempt to revoke access by an unauthorized user
            await expect(
                shr.secureHealthRecordsContract.connect(shr.accounts[1]).revokeAccess(1, grantee)
            ).to.be.reverted; // Specify the expected error message or custom error
        });

        it("Should only allow authorized accounts to retrieve health records", async function () {
            const { poi, shr } = await loadFixture(setup);

            const c = shr.secureHealthRecordsContract.connect(shr.accounts[0]);

            const patient = shr.accountAddresses[0];
            const grantee = shr.accountAddresses[1];
            const unauthorizedUser = shr.accountAddresses[2];
            const healthRecordData = "Patient Health Data";

            await poi.issueIdentity(randIdArgs(patient));
            await c.addHealthRecord(1, healthRecordData);
            await c.grantAccess(1, grantee);

            // Attempt to retrieve the health record by an unauthorized user
            await expect(
                shr.secureHealthRecordsContract.connect(shr.accounts[2]).getHealthRecord(1)
            ).to.be.reverted; // Specify the expected error message or custom error

            // Retrieve the health record by an authorized user
            const storedRecord = await shr.secureHealthRecordsContract.connect(shr.accounts[1]).getHealthRecord(1);

            expect(storedRecord).to.equal(healthRecordData);
        });
    });
});
