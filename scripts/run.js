const main = async () => {
    const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
    
    //deploy ether to waver
    const waveContract = await waveContractFactory.deploy({
        value: hre.ethers.utils.parseEther('1.0'),
    });
    await waveContract.deployed();
    console.log('Contract addy:', waveContract.address);

    //get contract balance
    let contractBalance = await hre.ethers.provider.getBalance(
        waveContract.address
    );
    console.log(
        'Contract Balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );

    
    //send wave
    const waveTxn = await waveContract.wave('this is wave#1');
    await waveTxn.wait(); //wait for the transaction to me mined

    const waveTxn2 = await waveContract.wave('this is wave#2');
    await waveTxn.wait(); //wait for the transaction to me mined

    //get contract balance to see what happens
    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
        console.log('Contract Balance: ',
        hre.ethers.utils.formatEther(contractBalance)
    );

    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
};

const runMain = async () => {
    try {
        await main();
        process.exit(0); // exit Node process without error
    }   catch (error) {
        console.log(error);
        process.exit(1); //exit Node process while indicating 'Uncaught Fatal Exception' error
    };
};

runMain();