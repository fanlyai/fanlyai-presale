import Image from "next/image";
import { Josefin_Sans } from "next/font/google";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ProgressBar from "@/components/ProgressBar";

const jose = Josefin_Sans({ weight: "400", subsets: ["latin"] });

const referralMapping = {
  123: "0x6ae7B161c9917Fe8d618e0c6aB9DB6a8C2e42bEa",
  456: "0xeB054C4Ab3556117717d94FD47117F81589e25e0",
};

const defaultAddress = "0xa2907e593B1572499f225FB59a6dC5b632192636";

export default function Home() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (progress < 100) {
        setProgress(0);
      } else {
        clearInterval(interval);
      }
    }, 1000);

    // Cleanup the interval on component unmount
    return () => clearInterval(interval);
  }, [progress]);

  const [amount, setAmount] = useState(0.1);
  const [ref, setRef] = useState("");

  function calculate(amount) {
    return amount *1;
  }

  const [signer, setSigner] = useState();

  useEffect(() => {
    // This function checks if the user is already connected to MetaMask
    const checkIfWalletIsConnected = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(
            window.ethereum,
            "goerli"
          );
          const accounts = await provider.listAccounts();

          if (accounts.length > 0) {
            const signer = provider.getSigner();
            setSigner(signer);
            console.log("Connected to wallet:", await signer.getAddress());
          } else {
            console.log("No wallet connected");
            
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        console.log("Ethereum object not found");
      }
    };

    checkIfWalletIsConnected();
  }, []);

  // Connect to MetaMask and initialize web3 instance
  async function connectWallet() {
    // Check if the browser has MetaMask (or another dApp browser)
    if (typeof window.ethereum !== "undefined") {
      let provider = new ethers.providers.Web3Provider(
        window.ethereum
       
      );

      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        let signer = setSigner(provider.getSigner());

        console.log("Connected to wallet:", await signer.getAddress());
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.error("Ethereum provider (e.g., MetaMask) not detected");
    }
  }

  //{ref == "123" ? "0x3986cD029F76A76Bf1FeDd8459022604A5A6Aa38" : ref == "456" ? "0xeB054C4Ab3556117717d94FD47117F81589e25e0" : "0xa2907e593B1572499f225FB59a6dC5b632192636"}

  async function sendEther() {
    if (!signer) {
      console.error("Wallet not connected");
      
      return;
    }

    const toAddress = referralMapping[ref] || defaultAddress; // Replace with the recipient's address
    const amountInEther = amount;
    const amountInWei = ethers.utils.parseEther(amountInEther.toString());

    try {
      const tx = await signer.sendTransaction({
        to: toAddress,
        value: amountInWei,
        
      });

      console.log("Transaction Hash:", tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction was mined in block", receipt.blockNumber);
    } catch (error) {
      console.error("Error sending transaction:", error);
      
    }
  }

  return (
    <main
      className={`flex min-h-screen tracking-widest flex-col items-center ${jose.className}  pb-8 uppercase`}
    >
   
   <Image src="/ormblue.png" alt="orm" className="absolute opacity-50 left-[-80px] block z-0 top-20 " width={800} height={300}></Image>

      <Image src="/logo.png" width={350} height={200} className="py-8"/>
     
      <div className="flex rounded-xl  filter backdrop-blur-sm  justify-start p-12 items-start border border-[#C80FB0]  w-full md:w-[550px] h-[600px] md:h-[650px]">
        <div>

          <div className="flex tracking-widest flex-col text-center">
            <p className="text-white">
              MIN BUY : <span className="text-lg"> 0.1 $ETH</span>
            </p>
            <p className="text-white">
              MAX BUY : <span className="text-lg"> 1 $ETH</span>
            </p>
            <p className="text-white">
              PRESALE PRICE :
              <span className="text-lg">
                
                ?????????? $FAIN per 0.1 $ETH
              </span>
            </p>
          </div>
          <div className="pt-4 pb-2 tracking-widest w-full md:w-[450px] text-center flex flex-col justify-center">
            <p className="text-white tracking-widest py-2">Enter REF Code</p>
            <input
              maxLength={6}
              className="w-full  disabled:cursor-not-allowed p-2 bg-gray-300 rounded-lg"
              placeholder="Reference Code"
              onChange={(event) => setRef(event.target.value)}
            ></input>
            <p className="text-white tracking-widest pb-2 pt-4">
              Enter $ETH Amount
            </p>
            <input
              disabled={ref ? false : true}
              className="w-full disabled:cursor-not-allowed disabled:opacity-40 p-2 bg-gray-300 rounded-lg"
              placeholder="Amount"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            ></input>
            <p className="text-white text-xl pt-4 flex items-center gap-2 justify-center">
              Total: {calculate(amount)} $FAIN
              <Image className="pb-[5px]" src="/test4.png" width={30} height={30}></Image>
            </p>
          </div>
          <div className="w-full ">
            <button
              disabled={signer ? true : false}
              onClick={connectWallet}
              className="text-black disabled:opacity-40 tracking-widest  uppercase  bg-white w-full mb-2 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {signer ? "Wallet Connected" : "Connect Wallet"}
            </button>
            <button
              onClick={sendEther}
              disabled={(calculate(amount) < 40848484848.5 ? "Amount must be greater then min" : calculate(amount) > 408484848485) || ref == "" || !signer  ? true : false}
              className="text-black tracking-widest uppercase bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {calculate(amount) < 40848484848.5 ? "Amount must be greater then min" : calculate(amount) > 408484848485 ? "Amount must be lower then max" : "Buy Now"}
            </button>
            {signer ? (
              " "
            ) : (
              <p className="text-red-600 py-2 flex justify-center">
                Please Connect Wallet
              </p>
            )}
            <ProgressBar percentage={progress} />

            {/*<p className="tracking-widest text-xl text-center text-white">
             
             Remaining Time : 
            </p><Timer></Timer>*/}
          </div>
        </div>
      </div>
    </main>
  );
}
