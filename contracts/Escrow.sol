// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Escrow {
	address public arbiter;
	address public beneficiary;
	address public depositor;
	string public note;

	bool public isApproved;

	constructor(address _arbiter, address _beneficiary, string memory _note) payable {
		arbiter = _arbiter;
		beneficiary = _beneficiary;
		note = _note;
		depositor = msg.sender;
	}

	event Approved(uint);

	function approve() external {
		require(msg.sender == arbiter);
		uint balance = address(this).balance;
		(bool sent, ) = payable(beneficiary).call{value: balance}("");
 		require(sent, "Failed to send Ether");
		emit Approved(balance);
		isApproved = true;
	}

	// * receive function
    receive() external payable {}

    // * fallback function
    fallback() external payable {}
}
