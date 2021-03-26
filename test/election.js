const chai = require("chai");
const { assert, expect } = require("chai");
chai.use(require("chai-as-promised"))

//const expect = chai.expect

var Election = artifacts.require("./Election.sol");
 
contract("Election", accounts => {

    let electionInstance 
    beforeEach(async () => {
        electionInstance = await Election.new()
    })

    describe("constructor", () => {
        it("initializes counts to zero", async () => {
            assert.equal(await electionInstance.candidateCount(), 0)
            assert.equal(await electionInstance.voteCount(), 0)
        })
        it("initializes stickers to 100", async() => {
            assert.equal(await electionInstance.totalSupply(), 100)
            assert.equal(await electionInstance.balanceOf(electionInstance.address), 100)
        })
    })
    
    describe("register", () => {
        //in each it block, a new instance is generated

        it("should reject with double register", async () => {
            await electionInstance.register("Kyle", {
                from: accounts[1],
            })

            await expect(
                electionInstance.register("Kyle", {
                    from: accounts[1],
                })
            ).to.be.rejected

            assert.equal(await electionInstance.candidateCount(), 1, "Candidate count not incremented")
        })

        it("should reject with invalid tag", async () => {
            await expect(
                electionInstance.register("", {
                    from: accounts[1],
                })
            ).to.be.rejected

            assert.equal(await electionInstance.candidateCount(), 0, "Candidate count not incremented")
        })

        it("should be valid", async () => {
            const { logs } = await electionInstance.register("Kyle", {
                from: accounts[1],
            })

            assert.equal(await electionInstance.candidateCount(), 1, "Candidate count incremented")

            assert.equal(logs[0].event, "Register", "Register event emitted")
            assert.equal(logs[0].args.owner, accounts[1], "Event emitted correct account")
            assert.equal(logs[0].args.id, 1, "Event emitted correct id")
            assert.equal(logs[0].args.tag, "Kyle", "Event emitted correct tag")
        
            const candidate = await electionInstance.getCandidate(1)
            assert.equal(candidate.id, 1, "Correct candidate id added")
            assert.equal(candidate.tag, "Kyle", "Correct candidate tag added")
            assert.equal(candidate.numVotes, 0, "Correct candidate numVotes added")

            // TODO: why doesn't this work
            // assert.equal(candidate.owner, accounts[0], "Correct account owner added")
        
            // Cannot directly call mappings in this test framework
            // const cIndex = await electionInstance.addressToId(accounts[0])
            // assert.equal(cIndex, 1, "Candidate Index added to mapping")
        })

        it("size test", async () => {
            for (let i = 1; i < 10; ++i) {
                const { logs } = await electionInstance.register("Kyle" + i, {
                    from: accounts[i],
                })
            
                assert.equal(await electionInstance.candidateCount(), i, "Candidate count incremented")

                assert.equal(logs[0].event, "Register", "Register event emitted")
                assert.equal(logs[0].args.owner, accounts[i], "Event emitted correct account")
                assert.equal(logs[0].args.id, i, "Event emitted correct id")
                assert.equal(logs[0].args.tag, "Kyle" + i, "Event emitted correct tag")

                const candidate = await electionInstance.getCandidate(i)
                assert.equal(candidate.id, i, "Correct candidate id added")
                assert.equal(candidate.tag, "Kyle" + i, "Correct candidate tag added")
                assert.equal(candidate.numVotes, 0, "Correct candidate numVotes added")
            }
        })     
    })

    describe("vote", () => {

        beforeEach(async () => {
            await electionInstance.register("Kyle", { from: accounts[1] })
            await electionInstance.register("Jack", { from: accounts[2] })
            await electionInstance.register("Amy", { from: accounts[3] })
        })

        it("should reject if candidate is zero", async () => {
            await expect(
                electionInstance.vote(0, {
                    from: accounts[1]
                })
            ).to.be.rejected

            assert.equal(await electionInstance.voteCount(), 0, "Vote count not incremented")
        })

        it("should reject if candidate is not registered", async () => {
            await expect(
                electionInstance.vote(4, {
                    from: accounts[1]
                })
            ).to.be.rejected

            assert.equal(await electionInstance.voteCount(), 0, "Vote count not incremented")
        })

        it("should reject voting twice", async () => {
            await electionInstance.vote(1, { from: accounts[1] })

            await expect(
                electionInstance.vote(2, {
                    from: accounts[1]
                })
            ).to.be.rejected

            assert.equal(await electionInstance.voteCount(), 1, "Vote count not incremented")

            let candidate = await electionInstance.getCandidate(1)
            assert.equal(candidate.numVotes, 1, "Correct candidate numVotes added")

            candidate = await electionInstance.getCandidate(2)
            assert.equal(candidate.numVotes, 0, "numVotes not incremented")
        })

        it("should be valid", async () => {
            const { logs } = await electionInstance.vote(1, { from: accounts[1] })

            assert.equal(await electionInstance.voteCount(), 1, "Vote count incremented")

            assert.equal(logs[0].event, "Transfer", "Transfer event emitted")
            assert.equal(logs[0].args.from, electionInstance.address, "Event emitted correct from address")
            assert.equal(logs[0].args.to, accounts[1], "Event emitted correct to address")
            assert.equal(logs[0].args.value, 1, "Event emitted correct id")

            assert.equal(logs[1].event, "Vote", "Vote event emitted")
            assert.equal(logs[1].args.owner, accounts[1], "Event emitted correct account")
            assert.equal(logs[1].args.id, 1, "Event emitted correct id")
        
            const candidate = await electionInstance.getCandidate(1)
            assert.equal(candidate.numVotes, 1, "Correct candidate numVotes added")

            //TODO: check which id a person voted for
        })

        it("size test", async () => {
            for (let i = 1; i <= 3; ++i) {
                const { logs } = await electionInstance.vote(1, { from: accounts[i] })

                assert.equal(await electionInstance.voteCount(), i, "Vote count incremented")

                assert.equal(logs[0].event, "Transfer", "Transfer event emitted")
                assert.equal(logs[0].args.from, electionInstance.address, "Event emitted correct from address")
                assert.equal(logs[0].args.to, accounts[i], "Event emitted correct to address")
                assert.equal(logs[0].args.value, 1, "Event emitted correct id")

                assert.equal(logs[1].event, "Vote", "Vote event emitted")
                assert.equal(logs[1].args.owner, accounts[i], "Event emitted correct account")
                assert.equal(logs[1].args.id, 1, "Event emitted correct id")
            
                const candidate = await electionInstance.getCandidate(1)
                assert.equal(candidate.numVotes, i, "Correct candidate numVotes added")
                assert.equal(await electionInstance.balanceOf(electionInstance.address), 100-i, "transfer stickers from initial holder"); 
                assert.equal(await electionInstance.balanceOf(accounts[i]), 1, "transfer to voter"); 
            }
        })

    })

});