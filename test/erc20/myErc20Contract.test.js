const { expect, assert } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert, constants } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// Load compiled artifacts
const erc20 = artifacts.require('MYERC20');

let instance

// Start test block
contract('MYERC20', accounts  => {

  const NAME = 'MyToken';
  const SYMBOL = 'My';

  beforeEach(async ()  => {
    instance = await erc20.new(NAME, SYMBOL)
  })

  it('tests that contract has 18 decimals', async () =>  {
    assert.equal(await instance.decimals(), 18)
  })

  it('tests that name is correct', async() => {
    assert.equal(await instance.name(), NAME)
  })

  it('tests that symbol is correct', async() => {
    assert.equal(await instance.symbol(), SYMBOL)
  })

  it('tests that initial total supply is 0', async() => {
    assert.equal(await instance.totalSupply(), 0)
  })

  it('tests transfer fail recipient is address zero', async() => {
    await expectRevert(instance.transfer('0x0000000000000000000000000000000000000000', 50),'ERC20: transfer to the zero address')
  })

  it('tests transfer fail not enough balance', async() => {
    await expectRevert(instance.transfer(accounts[1], 50),'ERC20: transfer amount exceeds balance')
  })

  it('tests mint fail to zero address', async() => {
    await expectRevert(instance.mint('0x0000000000000000000000000000000000000000', 50),'ERC20: mint to the zero address')
  })

  it('tests mint function', async() => {
    await instance.mint(accounts[1], 50)
    assert.equal(await instance.totalSupply(), 50)
  })

  it('tests mint and balanceOf functions', async() => {
    await instance.mint(accounts[1], 50)
    assert.equal(await instance.balanceOf(accounts[1]), 50)
  })

  it('tests mint and transfer functions', async() => {
    await instance.mint(accounts[1], 50)
    await instance.transfer(accounts[2], 20, {from: accounts[1]})
    assert.equal(await instance.balanceOf(accounts[2]), 20)
  })

  it('tests approve function fail due to zero address', async() => {
    await expectRevert(instance.approve('0x0000000000000000000000000000000000000000', 30), 'ERC20: approve to the zero address')
  })

  it('tests approve function', async() => {
    await expectEvent(
      await instance.approve(accounts[0],30),
      'Approval'
    )
  })

  it('tests allowance function', async() => {
    await instance.increaseAllowance(accounts[0], 20, {from: accounts[1]})
    assert.equal(
      20,
      await instance.allowance(accounts[1], accounts[0])
      )
  })

  it('test transferFrom function fail', async() => {
    await instance.mint(accounts[1], 50)
    await expectRevert(instance.transferFrom(accounts[1], accounts[0], 30), 'ERC20: transfer amount exceeds allowance')
  })

  it('test transferFrom function is succeed and calls approval event', async() => {
    await instance.mint(accounts[1], 50)
    await instance.increaseAllowance(accounts[1], 50, {from: accounts[1]})
    await expectEvent(
      await instance.transferFrom(accounts[1], accounts[0], 30, {from:accounts[1]}),
      'Approval'
    )
  })

  it('test increaseAllowance function fail due to zero address approval', async() => {
    await expectRevert(instance.increaseAllowance('0x0000000000000000000000000000000000000000', 50), 'ERC20: approve to the zero address')
  })

  it('test increaseAllowance function', async() => {
    await instance.mint(accounts[1], 50)
    await expectEvent(
      await instance.increaseAllowance(accounts[0], 20, {from: accounts[1]}),
      'Approval'
    )
  })
  
  it('test decreaseAllowance function fail case', async() => {
    await expectRevert(instance.decreaseAllowance(accounts[1], 50, {from: accounts[1]}), 'ERC20: decreased allowance below zero')
  })

  it('test decreaseAllowance function success case', async() => {
    await instance.increaseAllowance(accounts[1], 50, {from: accounts[1]})
    await expectEvent(
      await instance.decreaseAllowance(accounts[1], 20, {from: accounts[1]}),
      'Approval'
    )
  })

  it('test decreaseAllowance function success case', async() => {
    await instance.increaseAllowance(accounts[1], 50, {from: accounts[1]})
    await instance.decreaseAllowance(accounts[1], 20, {from: accounts[1]})
    assert.equal(await instance.allowance(accounts[1], accounts[1]), 30)
  })
});