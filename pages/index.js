import Image from "next/image";
import { Josefin_Sans, Outfit } from "next/font/google";
import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { readContract, writeContract, watchContractEvent } from "@wagmi/core";
import { useAccount } from "wagmi";
import Web3 from "web3";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const jose = Josefin_Sans({ weight: "400", subsets: ["latin"] });
const out = Outfit({ weight: "200", subsets: ["latin"] });

export default function Home() {
  const accountData = useAccount();

  const BSC_MAINNET_RPC = "https://bsc-dataseed1.binance.org/"; // BSC Mainnet RPC URL

  const abi = [
    {
      inputs: [
        { internalType: "address", name: "_token", type: "address" },
        { internalType: "uint256", name: "_rate", type: "uint256" },
        { internalType: "uint256", name: "_maxPurchase", type: "uint256" },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      inputs: [
        { internalType: "uint256", name: "tokenAmount", type: "uint256" },
        { internalType: "uint256", name: "refCode", type: "uint256" },
      ],
      name: "buyTokens",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "refCode", type: "uint256" }],
      name: "getReferrer",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "maxPurchase",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "owner",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "", type: "address" }],
      name: "purchasedTokens",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "rate",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "newMaxPurchase", type: "uint256" },
      ],
      name: "setMaxPurchase",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "newRate", type: "uint256" }],
      name: "setRate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "uint256", name: "refCode", type: "uint256" },
        { internalType: "address", name: "referrer", type: "address" },
      ],
      name: "setReferral",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "token",
      outputs: [{ internalType: "contract IERC20", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ];

  const [isRefCodeValid, setIsRefCodeValid] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [rate, setRate] = useState();

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
        console.log(walletAddress);
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };
  const contractAddress = "0xdEeE1Bfb78a62DC74f99dDC5241fca9053F4E99d";

  console.log(typeof abi);

  function calculateBNB(amount) {
    let result = amount * (0.00008).toFixed(6);
    if (amount == 10000) {
      return 0.8;
    }
    if (amount == 10) {
      return 0.0008;
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

  const getRate = async () => {
    const rate = await readContract({
      address: contractAddress,
      abi: abi,
      functionName: "rate",
    });
    const rateInt = parseInt(rate);
    const updateRate = rateInt / 10 ** 18;
    console.log(updateRate);
    setRate(updateRate);
    return updateRate;
  };

  useEffect(() => {
    getRate();
  }, []);

  // Function to buy tokens
  const buyTokens = async (amount, refCode) => {
    try {
      const web3 = new Web3(window.ethereum);
      getRate();
      console.log("rate : " + rate);
      const requiredBNB = web3.utils.toWei(amount / rate, "ether");
      alert("Open MetaMask App on your phone to approve buy.")
      const newReq = requiredBNB / 10 ** 18;
      console.log("REQ: " + newReq + typeof newReq);
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: "buyTokens",
        value: requiredBNB,
        args: [amount * 10 ** 9, refCode],
      });
      console.log(hash);
      
    } catch (error) {
      console.error("Error in buyTokens function:", error);
      alert(error);
    }
  };
 

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setWalletAddress(accounts[0] || "");
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
      className={`flex min-h-screen overflow-hidden md:pb-8 pb-80 bg-black tracking-widest z-50 flex-col items-center   `}
    >
      <div className="absolute flex top-24 md:top-80 opacity-40 flex-col space-y-1">
        <div className="w-screen h-[1px]  bg-white"></div>
        <div className="w-screen h-[2px] bg-white"></div>
        <div className="w-screen h-[3px] bg-white"></div>
        <div className="w-screen h-[4px] bg-white"></div>
        <div className="w-screen h-[5px] bg-white"></div>
        <div className="w-screen h-[6px] bg-white"></div>
        <div className="w-screen h-[7px] bg-white"></div>
        <div className="w-screen h-[8px] bg-white"></div>
        <div className="w-screen h-[9px] bg-white"></div>
        <div className="w-screen h-[10px] bg-white"></div>
        <div className="w-screen h-[12px] bg-white"></div>
        <div className="w-screen h-[14px] bg-white"></div>
        <div className="w-screen h-[16px] bg-white"></div>
        <div className="w-screen h-[18px] bg-white"></div>
        <div className="w-screen h-[20px] bg-white"></div>
        <div className="w-screen h-[22px] bg-white"></div>
        <div className="w-screen h-[24px] bg-white"></div>
        <div className="w-screen h-[30px] bg-white"></div>
        <div className="w-screen h-[36px] bg-white"></div>
        <div className="w-screen h-[40px] bg-white"></div>
        <div className="w-screen h-[46px] bg-white"></div>
        <div className="w-screen h-[52px] bg-white"></div>
      </div>
      <div className="absolute z-0 left-0 h-full w-full overflow-hidden ">
        <div className="absolute left-1/2 top-[50px] md:top-[50px] ml-[-2000px] h-[4000px] w-[4000px] rounded-full bg-transparent shadow-[0px_10px_100px_0px_rgba(255,255,255)] "></div>
      </div>

      <div className={`text-5xl  text-black ${out.className}`}>
        <Image src="/vuzzAIlogo.png" width={150} height={200}></Image>
      </div>

      <p className={`text-white text-3xl pb-8  ${out.className}`}>
        $VUZZ private sale
      </p>

      <div
        className={`flex rounded-xl   text-white overflow-hidden  filter backdrop-blur-sm md:backdrop-blur-lg ${jose.className} justify-start p-12 items-start border border-gray-300
  w-full md:w-[550px] h-full md:h-full`}
      >
        <div>
          <div className="flex tracking-widest flex-col text-center">
            <p>
              min buy : <span className="text-lg"> 1250 $VUZZ</span>{" "}
            </p>
            <p>
              max buy : <span className="text-lg"> 312500 $VUZZ</span>{" "}
            </p>
            <p>
              price :<span className="text-lg"> 12500 $VUZZ per 1 $BNB</span>{" "}
            </p>
          </div>
          <div className="absolute left-0 h-full w-full overflow-hidden ">
            <div className="md:block hidden absolute left-1/2 top-[620px] md:top-[300px] ml-[-2000px] h-[4000px] w-[4000px] rounded-full bg-transparent shadow-[0px_10px_100px_0px_rgba(255,255,255)_inset] "></div>
          </div>
          <div className="pt-4 pb-2 tracking-widest w-full md:w-[450px] text-center flex flex-col justify-center">
            <p className=" tracking-widest py-2">Enter REF Code</p>
            <input
              maxLength={8}
              className="py-[8px] z-50 placeholder:text-[#606060] placeholder:text-sm bg-[#212121] text-gray-300 w-full px-4 rounded-2xl  "
              placeholder="please enter reference code"
              onChange={(event) => setRef(event.target.value)}
            ></input>
            <p className=" tracking-widest pb-2 pt-4">Enter $VUZZ amount</p>
            <input
              disabled={isRefCodeValid ? false : true}
              className="py-[8px] z-50 disabled:opacity-70  placeholder:text-[#606060] placeholder:text-sm bg-[#212121] text-gray-300 w-full px-4 rounded-2xl  "
              placeholder={
                !isRefCodeValid ? "Reference code invalid" : "$VUZZ amount"
              }
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            ></input>
            <div className=" flex flex-col items-center text-xl pt-4">
              <div className="flex  items-center justify-center">
                Total: {calculate(amount)} $VUZZ
                
              </div>
              <div>Total: {calculateBNB(amount)} $BNB</div>
            </div>
          </div>
          <div className="w-full flex flex-col space-y-4 justify-center items-center">
            <ConnectButton ></ConnectButton>

            <button
              onClick={() => buyTokens(amount, ref)}
              disabled={accountData.address && isRefCodeValid && (calculate(amount) < 312500 && calculate(amount) > 12 )? false : true }
              className="text-black border z-50 border-black tracking-widest uppercase bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {accountData.address ? ((isRefCodeValid ? ( calculate(amount) < 12
                ? "Amount must be greater than min"
                : calculate(amount) > 312500
                ? "Amount must be lower than max"
                : "Buy Now" ) : "Please Enter Valid Reference code")  ): "Connect Wallet"}
            </button>
            {accountData.address ? (
              " "
            ) : (
              <p className="text-black mb-4 flex justify-center">
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
