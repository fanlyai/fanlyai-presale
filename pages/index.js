import Image from "next/image";
import { Josefin_Sans, Outfit } from "next/font/google";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import Web3 from "web3";
import abi from "./contractabi.json";
const jose = Josefin_Sans({ weight: "400", subsets: ["latin"] });
const out = Outfit({ weight: "200", subsets: ["latin"] });




export default function Home() {
  const BSC_MAINNET_RPC = "https://bsc-dataseed1.binance.org/"; // BSC Mainnet RPC URL
 
  


  const [isRefCodeValid, setIsRefCodeValid] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");

  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");




  function calculate(amount) {
    return amount;
  }

  const [signer, setSigner] = useState();

  // Connect to MetaMask and initialize web3 instance

  const connectWalletHandler = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setWalletAddress(accounts[0]);
        console.log(walletAddress)
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };
  const contractAddress = "0x7857272fFF892694a8D12D3C4a3974e775de7CD0";

  console.log(typeof abi);

  function calculateBNB(amount) {
    let result = amount * (0.000048).toFixed(6);
    if (amount == 10000) {
      return 0.48;
    }
    if (amount == 100) {
      return 0.0048;
    }
    return result;
  }

  async function isReferralCodeValid(refCode) {
    const web3 = new Web3(new Web3.providers.HttpProvider(BSC_MAINNET_RPC));
    const contract = new web3.eth.Contract(abi, contractAddress);
    try {
      const referrerAddress = await contract.methods
        .getReferrer(refCode)
        .call();
      return referrerAddress !== "0x0000000000000000000000000000000000000000";
    } catch (error) {
      console.error("Error checking referral code:", error);
      return false;
    }
  }

  // Function to buy tokens
  const buyTokens = async (amount, refCode) => {
    try {
      // Initialize Web3 and contract
     // Assumes MetaMask is used
     const web3 = new Web3(window.ethereum);
      const contract = new web3.eth.Contract(abi, contractAddress);

 
    
      // Calculate required BNB based on the token amount and rate
      const rate = await contract.methods.rate().call();
      const rateInt = parseInt(rate); // Get the rate from the contract
      const updateRate = rateInt / 10 ** 18;

      console.log(updateRate);
      console.log(amount);

      const requiredBNB = web3.utils.toWei(
        (amount / updateRate).toString(),
        "ether"
      );
      console.log(requiredBNB );
      console.log(refCode);
      
      await contract.methods
        .buyTokens(amount * 10 ** 9, refCode)
        .send({
          from: walletAddress,
          value: requiredBNB ,
          gasPrice: '20000000000'
        })
        .on("transactionHash", (hash) => {
          console.log("Transaction hash:", hash);
        })
        .on("receipt", (receipt) => {
          console.log("Receipt:", receipt);
        })
        .on("error", (error) => {
          console.error("Transaction failed:", error);
        });
    } catch (error) {
      console.error("Error in buyTokens function:", error);
    }
  };
  useEffect(() => {
    if (window.ethereum) {
      connectWalletHandler();
    }
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setWalletAddress(accounts[0] || '');
      });
    }
  }, []);
  useEffect(() => {
    if (ref) {
      isReferralCodeValid(ref).then(setIsRefCodeValid);
    } else {
      setIsRefCodeValid(false);
    }
  }, [ref]);

 


  return (
    <main
      className={`flex min-h-screen bg-white tracking-widest flex-col items-center   pb-8 `}
    >
      <Image
        src="/ormblue.png"
        alt="orm"
        className="absolute opacity-50 left-[-80px] block z-0 top-20 "
        width={800}
        height={300}
      ></Image>
    
        <div className={`text-5xl py-12 text-black ${out.className}`}>
          fanly<span className="text-[#C80FB0]">AI</span>
        </div>
     

      <p className={`text-[#C80FB0] text-3xl pb-8  ${out.className}`}>$FAIN private sale</p>

      <div
        className={`flex rounded-xl text-black   filter backdrop-blur-sm ${jose.className} justify-start p-12 items-start border border-gray-300
  w-full md:w-[550px] h-[600px] md:h-[550px]`}
      >
        <div>
          <div className="flex tracking-widest flex-col text-center">
            <p >
            min buy : <span className="text-lg"> 1000 $FAIN</span>{" "}
            </p>
            <p >
            max buy : <span className="text-lg"> 1000000000 $FAIN</span>{" "}
            </p>
            <p >
            price :
              <span className="text-lg"> 20.834 FAIN per 0.1 $BNB</span>{" "}
            </p>
          </div>
          <div className="pt-4 pb-2 tracking-widest w-full md:w-[450px] text-center flex flex-col justify-center">
            <p className=" tracking-widest py-2">Enter REF Code</p>
            <input
              maxLength={6}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed text-black p-2 bg-[#e6cce6] rounded-lg"
              placeholder="please enter reference code"
              onChange={(event) => setRef(event.target.value)}
            ></input>
            <p className=" tracking-widest pb-2 pt-4">
            Enter $FAIN amount
            </p>
            <input
              disabled={isRefCodeValid ? false : true}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed disabled:opacity-40 p-2 bg-[#e6cce6]  rounded-lg"
              placeholder={
                !isRefCodeValid ?"please enter reference code": "$FAIN amount"
              }
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            ></input>
            <div className=" flex flex-col items-center text-xl pt-4">
              <div className="flex  items-center justify-center">Total: {calculate(amount)} $FAIN <span><Image className="pb-1" src="/test4.png" width={32} height={32}></Image></span> </div>
              <div>Total: {calculateBNB(amount)}  $BNB</div>
             
            </div>
          </div>
          <div className="w-full ">
            <button
              disabled={walletAddress ? true : false}
              onClick={connectWalletHandler}
              className="text-black disabled:opacity-40 tracking-widest border border-black  uppercase  bg-white w-full mb-2 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {walletAddress
                ? "Wallet: "+ walletAddress.substring(0, 9) + "..."
                : "Please connect wallet"}
            </button>
            <button
              onClick={() => buyTokens(amount, ref)}
              disabled={
                calculate(amount) < 10 ||
                calculate(amount) > 1000000000 ||
                !isRefCodeValid
                  ? true
                  : false
              }
              className="text-black border border-black tracking-widest uppercase bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {calculate(amount) < 10
                ? "Amount must be greater than min"
                : calculate(amount) > 1000000000
                ? "Amount must be lower than max"
                : "Buy Now"}
            </button>
            {walletAddress ? (
              " "
            ) : (
              <p className="text-red-600 py-2 flex justify-center">
               "Please connect wallet"
              </p>
            )}
            {/* <ProgressBar percentage={progress} /> */}

            {/*<p className="tracking-widest text-xl text-center text-white">
           
           Remaining Time : 
          </p><Timer></Timer>*/}
          </div>
        </div>
      </div>
    </main>
  );
}
