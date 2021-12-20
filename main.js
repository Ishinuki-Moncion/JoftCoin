const SHA256 = require('crypto-js/sha256');

class Block{
    //index - is optional and tells us where the bloch sits on the chain
    // timestamp - when block created
    // data - details of transaction, who is sender and reciever
    // previoushash - string that contains hash of block before this one
    constructor(index, timestamp, data, previousHash = ''){
        this.index = index; 
        this.timestamp = timestamp;
        this.data = data; 
        this.previousHash = previousHash; 
        this.hash = this.calculateHash();
    }

    //calculate hash function of this block, returns hash, use sha256
    calculateHash() { 
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data)).toString();
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
    }
    ////genesis block, first block on the chain
    createGenesisBlock() { 
        return new Block(0, "01/01/2017", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length -  1];
    }
    // add a new block on the chain/ array
    addBlock(newBlock){
        // neeeds to prev hash of the property
        newBlock.previousHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.calculateHash(); // update
        this.chain.push(newBlock); // push the new block to chain
    }
    //verify intergregity of the chain
    isChainValid() {
        for( let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            //checks

            //if the current block is not equal to the calculated block this the block is invalid 
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false;
            }

            //check if previousblock of the current hash is the real previous block
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }

        //if it gets to here and non of the checks are false then the block is true
        return true;
    }
}
//instance of blockchain
let joftCoin = new Blockchain();
//add a few blocks
joftCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));
joftCoin.addBlock(new Block(2, "10/07/2017", { amount: 10 }));

//check if blockchain is valid
console.log('Is blockchain valid? ' + joftCoin.isChainValid());

//tampering the block
//changing the data of the block, didnt recompute the hash
joftCoin.chain[1].data = { amount: 100 };
//recomputate the hash
joftCoin.chain[1].hash = joftCoin.chain[1].calculateHash();
//although we have tampered the block, the relationship with the previous block is still broken
//blockchain is meant to add block and never to delete a block
//we need a mechanism that detects a new block breaking a chian, or rolls back the changes in a correct state.
console.log('Is blockchain valid? ' + joftCoin.isChainValid());

//console.log(JSON.stringify(joftCoin, null, 4 ));