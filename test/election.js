var Election = artifacts.require("./Election.sol");
 
contract("Election", function(accounts) {
    var electionInstance; 

    it("initializes to zero", function() {
        return Election.deployed().then(function(instance) {
            electionInstance = instance; 
            return electionInstance.candidatesCount();
        }).then(function(candidatesCount) {
            assert.equal(candidatesCount, 0, "correctly initialized to zero");
            return electionInstance.voteCount(); 
        }).then(function(voteCount) {
            assert.equal(voteCount, 0, "correctly initialized to zero"); 
        });
    });

});