// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract ExampleExternalContract {

  bool public completed;

  function complete() public payable {
    completed = true;
  }

}
