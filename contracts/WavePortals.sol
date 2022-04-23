// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import 'hardhat/console.sol';
require('dotenv').config();

contract WavePortal {
    uint256 totalWaves; 
    
    //declare a seed for the randomizer
    uint256 private seed;

    //events stores the arguments passed in transaction logs and stores them on the blockchain
    event NewWave(address indexed from, uint256 timestamp, string message);

    //struct is basically a custom data type to store items
    struct Wave {
        address waver; //The address of the user who waved
        string message; //the message the user sent
        uint256 timestamp; //the timestamp when the user waved
    }

    //declare variable waves to store an array of structs
    Wave[] waves;

    //This is an address => uint mapping, meaning I can associate an address with a number! In this case, I'll be storing the address with the last time the user waved at us.
    mapping(address => uint256) public lastWavedAt;
    
    //set the seed for the prize difficulty
    constructor() payable {
        console.log('The first contract is the hardest!');

        //set the initial seed
        seed = (block.timestamp + block.difficulty) % 100;
    }
    
    //function that accepts messsage from front end user, increments waves count and sends message back to user
    function wave(string memory _message) public {
        
        //wait 15 minutes to wave again
        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp, 
            'Wait 30 seconds'
        );
        
        //update current timestamp we have for the user
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        console.log('%s has waved w/ message %s', msg.sender, _message);

        //store wave data in the array
        waves.push(Wave(msg.sender, _message, block.timestamp));

        //generate a new seed for the next user that sends a wave
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log('Random # generated: %d', seed);

        //give 50% chance that the user wins the prize
        if (seed <= 50) {
            console.log('%s won!', msg.sender);

            //give out prize
            uint256 prizeAmount = .00001 ether;
            require(
                prizeAmount <= address(this).balance,
                'Trying to withdraw more money than the contrat has.'
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, 'Failed to withdraw money from contract.');
        }
        
        //emit event
        emit NewWave (msg.sender, block.timestamp, _message);

    }
    
    //function that return the struct array, waves to us
    function getAllWaves() public view returns (Wave[] memory) {
        return waves;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }
}