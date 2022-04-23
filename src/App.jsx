import React, { useEffect, useState } from "react";
import { ethers } from 'ethers';
import "./App.css";
import abi from './utils/WavePortal.json'


const App = () => {
 
  const [currentAccount, setCurrentAccount] = useState("");
  
  //use state variables
  const [allWaves, setAllWaves] = useState([]);
  const [tweetValue, setTweetValue] = React.useState("");
  const [waveCount, setWaveCount] = useState(0);
  const [address, setAddress] = useState('No wallet connected');
  
  const contractAddress = '0x071Ed5973C2bE0EaD9cDfC8ce579281041979112';

  //create a variable to reference the abi import
  const contractABI = abi.abi;
    
  //create a method that gets all waves from your contract
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();
        
      //push address,timestamp and message to useState
        let wavesCleaned = [];
          waves.forEach(wave => {
            wavesCleaned.unshift({
              address: wave.waver,
              timestamp: new Date(wave.timestamp * 1000),
              message: wave.message
            });
        });

        //store data in React state
        setAllWaves(wavesCleaned);
      } else {
        console.log('Ehtereum object doesn\'t exist!')
      }
    } catch (error) {
      console.log(error);
    }
  }
  
  //access users account
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        
      } else {
        console.log("No authorized account found")
      }

      if (ethereum && accounts.length !== 0) {
        getAllWaves()
      }
      
    } catch (error) {
      console.log(error);
    }
  }
  
  //implement wallet connection.
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      
      console.log('Connected', accounts[0]);
      getAllWaves()
      setCurrentAccount(accounts[0]);
      getAddress()
      getWaveCount()
    } catch(error) {
      console.log(error)
    }
  }

  //retrieve the number of waves from our smart contrat.
  const wave = async () => {
    try {
      const { ethereum } = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      
        let count = await wavePortalContract.getTotalWaves();
        console.log('Retreived total wave count...', count.toNumber());
        
        //WRITE ON BLOCKCHAIN -- execute the actual wave from the smart contract.
        const waveTxn = await wavePortalContract.wave(tweetValue, { gasLimit: 300000 });
        console.log('Mining...⛏️', waveTxn.hash);

        await waveTxn.wait();
        console.log('Mined!!! 💎', waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log('Retrieved total wave count...', count.toNumber());
        getAllWaves()
        getAddress()
        getWaveCount()
      } else {
        console.log('Ethereum object doesn\'t exist');
      }
    } catch (error) {
      console.log(error)
    }
  }

  //Get total wave count to dispay it on the top left of app
  const getWaveCount = async () => {
    const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const count = await wavePortalContract.getTotalWaves();
        setWaveCount(count); // This will set the wave count to the state
    }
  }

  //Get metamask address to display it on the top right of app
  const getAddress = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        return;
      }

      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      let truncAccounts = ''
      for (let i = 0; i< 4; i++) truncAccounts += accounts[0][i];
      truncAccounts += '...';
      for (let i = accounts[0].length-4; i<accounts[0].length; i++) truncAccounts += accounts[0][i];
      setAddress(truncAccounts);
    } catch(error) {
      console.log(error)
    }
  }

  
  useEffect(() => {
    // checkIfWalletIsConnected()
    getWaveCount()
    getAddress()
  }, []);
  
  useEffect(() => {
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
      },
    ]);
  };

  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
    wavePortalContract.on("NewWave", onNewWave);
  }

  return () => {
    if (wavePortalContract) {
      wavePortalContract.off("NewWave", onNewWave);
    }
  };

}, []);

  
  return (
    
    <div className="mainContainer">
      <div className="dataContainer">
        <div> <span className='totalWaveButton'>{Number(waveCount)} total messages</span>
          <span onClick={connectWallet} className='totalWaveButton2'>{address}</span>
        </div>
        <div className='header'> <strong>Send your</strong>
          <span className="gradient-text"><strong> message</strong></span> to the <span className="gradient-text2"><strong> blockchain!</strong></span> 
        </div>
        
        <div className="bio">
        Hi there...I am Kleidi and this is my first blockchain project! Drop your message below for a chance to receive a prize⚡
        </div>
       <br></br>
        
       {
          currentAccount ? (<textarea className="tweetArea"
            placeholder="Type your message to the world!"
            color= 'white'
            
            id="tweet"
            value={tweetValue}
            onChange={e => setTweetValue(e.target.value)} />) : null
        }
        <br></br>
        {!currentAccount && (
          <button className='walletButton' onClick={connectWallet}>
          Connect Wallet 
          </button>
        )}
        {currentAccount && (
          <button className='waveButton' onClick={wave}>
          Message away ✨
          </button>
        )}
       
      
        {allWaves.map((wave,index) => {
          return (
            <div key={index} className='messages'>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: <span className='gradient-text3'>{wave.message}</span></div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App