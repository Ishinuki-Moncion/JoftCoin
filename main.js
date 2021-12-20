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
        this.nonce = 0;
    }

    //calculate hash function of this block, returns hash, use sha256
    calculateHash() { 
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    //take property called difficulty
    mineBlock(difficulty){
        //make hash of the block being with a certain amount of zeros
        //while loops keeps running until our hash starts with enough zeros 
        //take the substring of the character 0 and go all the way up to difficulty
        //keep running until all of these charcters does not equal to all zeros 
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            //calculate hash of block
            //without nonce this would be a infinite loop
            //nonce is a random number that has nothing to do with the block
            
            this.nonce++; //increment as long as our hash doesnt start with enough zeros
            this.hash = this.calculateHash();
        }

        console.log("Block mined: " + this .hash);
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        //as the difficulty increases it takes longer to mine
        this.difficulty = 5; 
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
        //newBlock.hash = newBlock.calculateHash(); // update
        newBlock.mineBlock(this.difficulty); 
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
console.log('Mining block 1...')
joftCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));

console.log('Mining block 2...')
joftCoin.addBlock(new Block(2, "10/07/2017", { amount: 10 }));

//check if blockchain is valid
//console.log('Is blockchain valid? ' + joftCoin.isChainValid());

//tampering the block
//changing the data of the block, didnt recompute the hash
//joftCoin.chain[1].data = { amount: 100 };
//recomputate the hash
//joftCoin.chain[1].hash = joftCoin.chain[1].calculateHash();
//although we have tampered the block, the relationship with the previous block is still broken
//blockchain is meant to add block and never to delete a block
//we need a mechanism that detects a new block breaking a chian, or rolls back the changes in a correct state.
//console.log('Is blockchain valid? ' + joftCoin.isChainValid());

//console.log(JSON.stringify(joftCoin, null, 4 ));