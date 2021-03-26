// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.4.22 <0.8.0;

import './interfaces/IERC20.sol';
import './libraries/SafeMath.sol';

contract Election is IERC20 {
    using SafeMath for uint; 

    event Vote(address indexed owner, uint indexed id);
    event Register(address indexed owner, uint indexed id, string tag);
    event Approval(address indexed owner, address indexed spender, uint value); 
    event Transfer(address indexed from, address indexed to, uint value);

    struct Candidate {
        address owner;
        uint id; 
        string tag;
        uint numVotes; 
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


    string public constant name = 'Sticker';
    string public constant symbol = 'STCKR';
    uint8 public constant decimals = 0;
    uint  public totalSupply;
    mapping(address => uint) public balanceOf;
    mapping(address => mapping(address => uint)) public allowance;

    constructor () public {
        _mint(address(this), 100); 
    }
    
    function vote(uint _id) public {
        require(
            candidateCount >= _id, 
            "candidate is not registered"
        ); 

        require(
            _id != 0, 
            "candidate id is zero"
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

        _transfer(address(this), msg.sender, 1);

        emit Vote(msg.sender, _id);
    }
    
    function register(string memory _tag) public {
    
        require(
            addressToId[msg.sender] == 0,
            "You are already registered"
            ); 
            
        require(
            keccak256(bytes(_tag)) != keccak256(bytes("")),
            "Invalid tag"
            );
        
        candidateCount = candidateCount + 1;
        addressToId[msg.sender] = candidateCount; 
        
        candidates[candidateCount] = Candidate({
            owner: msg.sender,
            id: candidateCount,
            tag: _tag, 
            numVotes: 0
        }); 

        emit Register(msg.sender, candidateCount, _tag);
    }

    function getCandidate (uint _cidx) public view
        returns (address addy, uint id, string memory tag, uint numVotes)
    {
        //assert there are enough candidates to return
        Candidate storage candidate = candidates[_cidx];

        return (
            candidate.owner,
            candidate.id, 
            candidate.tag, 
            candidate.numVotes
        );
    }

    function hasVoted(address _voter) public view returns (bool) {
        Ballot storage ballot = votes[_voter]; 

        return ballot.voted;
    }

    function _mint(address to, uint value) internal {
        totalSupply = totalSupply.add(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(address(0), to, value);
    }

    function _burn(address from, uint value) internal {
        balanceOf[from] = balanceOf[from].sub(value);
        totalSupply = totalSupply.sub(value);
        emit Transfer(from, address(0), value);
    }

    function _approve(address owner, address spender, uint value) private {
        allowance[owner][spender] = value;
        emit Approval(owner, spender, value);
    }

    function _transfer(address from, address to, uint value) private {
        balanceOf[from] = balanceOf[from].sub(value);
        balanceOf[to] = balanceOf[to].add(value);
        emit Transfer(from, to, value);
    }

    function approve(address spender, uint value) external returns (bool) {
        _approve(msg.sender, spender, value);
        return true;
    }

    function transfer(address to, uint value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function transferFrom(address from, address to, uint value) external returns (bool) {
        if (allowance[from][msg.sender] != uint(-1)) {
            allowance[from][msg.sender] = allowance[from][msg.sender].sub(value);
        }
        _transfer(from, to, value);
        return true;
    }
    
}