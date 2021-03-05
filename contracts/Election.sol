// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.8.0;

contract Election {
    event Vote(address indexed owner, uint indexed id);
    event Register(address indexed owner, uint indexed id, string name);

    struct Candidate {
        uint id; 
        string name;
        uint numVotes; 
        address owner;
    }

    struct Ballot {
        uint id;
        bool voted;
    }

    mapping(uint => Candidate) public candidates; 
    uint public candidateCount;
    
    mapping (address => uint) addressToId;
    
    mapping(address => Ballot) votes;
    uint public voteCount; 
    
    function vote(uint _id) public {
        require(
            candidateCount >= _id, 
            "candidate is not registered"
            ); 
            
        require(
            votes[msg.sender].voted == false,
            "You have already voted"
            ); 
            
        voteCount++; 
        votes[msg.sender] = Ballot({
            id: _id,
            voted: true
        });
        candidates[_id].numVotes++; 

        emit Vote(msg.sender, _id);
    }
    
    function register(string memory _name) public {
    
        require(
            addressToId[msg.sender] == 0,
            "You are already registered"
            ); 
            
        require(
            keccak256(bytes(_name)) != keccak256(bytes("")),
            "Invalid name"
            );
        
        candidateCount++;
        addressToId[msg.sender] = candidateCount; 
        
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            name: _name, 
            numVotes: 0, 
            owner: msg.sender
        }); 

        emit Register(msg.sender, candidateCount, _name);
    }

    function getCandidate (uint _cidx) public view
        returns (uint id, string memory name, uint numVotes, address addy)
    {
        Candidate storage candidate = candidates[_cidx];

        return (
            candidate.id, 
            candidate.name, 
            candidate.numVotes, 
            candidate.owner
        );
    }

    function hasVoted(address _voter) public view returns (bool) {
        Ballot storage ballot = votes[_voter]; 

        return ballot.voted;
    }
    
}