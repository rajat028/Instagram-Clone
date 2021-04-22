const { assert } = require('chai')
const { default: Web3 } = require('web3')

const Decentragram = artifacts.require('./Decentragram.sol')

require('chai')
  .use(require('chai-as-promised'))
  .should()

contract('Decentragram', ([deployer, author, tipper]) => {
  let decentragram

  before(async () => {
    decentragram = await Decentragram.deployed()
  })

  describe('deployment', async () => {
    it('deploys successfully', async () => {
      const address = await decentragram.address
      assert.notEqual(address, 0x0)
      assert.notEqual(address, '')
      assert.notEqual(address, null)
      assert.notEqual(address, undefined)
    })

    it('has a name', async () => {
      const name = await decentragram.name()
      assert.equal(name, 'Decentragram')
    })
  })

  describe('images', async () => {
    let result, imageCount;
    const hash = "1234";
    const imageDescription = "Image Description"

    before(async () => {
      result = await decentragram.uploadImage(hash, imageDescription, { from: author })
      imageCount = await decentragram.imageCount()
    })

    it("create images", async () => {
      assert.equal(imageCount, 1)
      const event = result.logs[0].args
      assert.equal(hash, event.hash, "hash is correct")
      assert.equal(imageCount.toNumber(), event.id.toNumber(), "id is correct")
      assert.equal(imageDescription, event.description, "image is correct")
      assert.equal(0, event.tipAmount, "tip amount is correct")
      assert.equal(author, event.author, "author is correct")

      // Image must have hash
      await decentragram.uploadImage("", "Image description", { from: author }).should.be.rejected
      // Image must have description 
      await decentragram.uploadImage("hash key", "", { from: author }).should.be.rejected
    })

    // Check from Struct
    it("List Images", async () => {
      const image = await decentragram.images(imageCount)
      assert.equal(hash, image.hash, "hash is correct")
      assert.equal(imageCount.toNumber(), image.id.toNumber(), "id is correct")
      assert.equal(imageDescription, image.description, "image is correct")
      assert.equal(0, image.tipAmount, "tip amount is correct")
      assert.equal(author, image.author, "author is correct")
    })

    it("allow user to tip images", async () => {
      // author balance before tip
      let oldAuthorBalance
      oldAuthorBalance = await web3.eth.getBalance(author)
      oldAuthorBalance = new web3.utils.BN(oldAuthorBalance)

      // tip image owner  
      result = await decentragram.tipImageOwner(imageCount, { from: tipper, value: web3.utils.toWei("1", "Ether") })

      // Success
      const event = result.logs[0].args
      assert.equal(imageCount.toNumber(), event.id.toNumber(), "Id is correct")
      assert.equal(hash, event.hash, "hash is correct")
      assert.equal(description, event.description, "description is correct")
      assert.equal('1000000000000000000', event.tipAmount, "tip amount is correct")
      assert.equal(author, event.author, "Author is correct")

      let newAuthorBalance
      newAuthorBalance = await web3.getBalance(author)
      newAuthorBalance = await web3.utils.BN(newAuthorBalance)

      let tipImageOwner
      tipImageOwner = web3.utils.toWei("1", "Ether")
      tipImageOwner = web3.utils.BN(tipImageOwner)

      const expectedBalance = oldAuthorBalance.add(tipImageOwner)

      assert.equal(newAuthorBalance.toString(), oldAuthorBalance.toString())

    })
  })
})