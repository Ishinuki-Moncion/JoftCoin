const SHA256 = require('crypto-js/sha256');

class Transaction{
    constructor(fromAddress, toAddress, amount){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
    }
}

//we need a mining reward, a new method to mine a new block for the pending transactions

class Block{
    //index - is optional and tells us where the bloch sits on the chain
    // timestamp - when block created
    // data - details of transaction, who is sender and reciever
    // previoushash - string that contains hash of block before this one
    constructor(timestamp, transactions, previousHash = ''){
        //this.index = index; // removed index because it is not useful in a blockchain. Order of blocks is determined by position in the array
        this.timestamp = timestamp;
        this.transactions = transactions; 
        this.previousHash = previousHash; 
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    //calculate hash function of this block, returns hash, use sha256
    calculateHash() { 
        return SHA256(this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
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

        console.log("Block mined: " + this.hash);
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesisBlock()];
        //as the difficulty increases it takes longer to mine
        this.difficulty = 2; 
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    ////genesis block, first block on the chain
    createGenesisBlock() { 
        return new Block("01/01/2017", "Genesis block", "0");
    }

    getLatestBlock(){
        return this.chain[this.chain.length -  1];
    }
    //this is removed for a new way to pend tranasctions
    /*
    // add a new block on the chain/ array
    addBlock(newBlock){
        // neeeds to prev hash of the property
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash(); // update
        newBlock.mineBlock(this.difficulty); 
        this.chain.push(newBlock); // push the new block to chain
    }
    */

    //there is a argument that info can be manipulated, however a peer to peer network and other nodes in the network wont accept the attempt if majority of hold the correct information 
    minePendingTransactions(miningRewardAddress){
        //if successfully mined then send the reward to this address
        //lets create a new block, pass along all pending transactions that are currently stored in blockchain
        //like bitcoin, adding all the tranastions to a block isnt possible because there are way too many pending transactions and because the block size cannot increase by one megabyte.
        //so instead miners gets to choose which transactions they include and which they don't. HENCE MERKLE TREE
        let block = new Block (Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);// mine with difficulty set in blockchain

        console.log('Block successfully mined');
        this.chain.push(block); //push it to the block
        
        //reset the pending trnasaction array and create a new transaction to give the miner his reward
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    createTransaction(transaction) {
        //add the transaction to the pending tranasction array
        this.pendingTransactions.push(transaction);

    }

    getBalanceofAddress(address){
        let balance = 0;
        //loop over all the blocks in the blockchain
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress == address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
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
//in reality address 1 and address 2 would be public key of someones wallet.
joftCoin.createTransaction(new Transaction('address1', 'address2', 100));
joftCoin.createTransaction(new Transaction('address2', 'address1', 50));

console.log('\nStarting the miner...');
joftCoin.minePendingTransactions('Daikies-address');

//mining reward will be sent when the next block is mined
console.log('\nBalance of Daikie is', joftCoin.getBalanceofAddress('Daikies-address'));

console.log('\nStarting the miner again...');
joftCoin.minePendingTransactions('Daikies-address');

console.log('\nBalance of Daikie is', joftCoin.getBalanceofAddress('Daikies-address'));

//add a few blocks
//console.log('Mining block 1...')
//joftCoin.addBlock(new Block(1, "10/07/2017", { amount: 4 }));

//console.log('Mining block 2...')
//joftCoin.addBlock(new Block(2, "10/07/2017", { amount: 10 }));

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