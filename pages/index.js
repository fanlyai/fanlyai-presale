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
    console.log(updateRate)
    setRate(updateRate)
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
      console.log("rate : "  + rate)
      const requiredBNB = web3.utils.toWei(
        (amount / rate),
        "ether"
      );
     
      const newReq = requiredBNB/ 10 **18;
      console.log("REQ: "+ newReq + typeof(newReq))
      const { hash } = await writeContract({
        address: contractAddress,
        abi: abi,
        functionName: 'buyTokens',
        value:requiredBNB,
        args: [
          amount * 10 ** 9,
          refCode
        ]
      });
      console.log(hash);
    } catch (error) {
      console.error("Error in buyTokens function:", error);
      alert(error)
    }
  };
  useEffect(() => {
    if (window.ethereum) {
      connectWalletHandler();
    }
  }, []);

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

      <p className={`text-[#C80FB0] text-3xl pb-8  ${out.className}`}>
        $FAIN private sale
      </p>

      <div
        className={`flex rounded-xl text-black   filter backdrop-blur-sm ${jose.className} justify-start p-12 items-start border border-gray-300
  w-full md:w-[550px] h-[600px] md:h-[550px]`}
      >
        <div>
          <div className="flex tracking-widest flex-col text-center">
            <p>
              min buy : <span className="text-lg"> 1250 $FAIN</span>{" "}
            </p>
            <p>
              max buy : <span className="text-lg"> 312500 $FAIN</span>{" "}
            </p>
            <p>
              price :<span className="text-lg"> 12500 $FAIN per 1 $BNB</span>{" "}
            </p>
            <p>{accountData.address?.toString()}</p>
          </div>
          <div className="pt-4 pb-2 tracking-widest w-full md:w-[450px] text-center flex flex-col justify-center">
            <p className=" tracking-widest py-2">Enter REF Code</p>
            <input
              maxLength={8}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed text-black p-2 bg-[#e6cce6] rounded-lg"
              placeholder="please enter reference code"
              onChange={(event) => setRef(event.target.value)}
            ></input>
            <p className=" tracking-widest pb-2 pt-4">Enter $FAIN amount</p>
            <input
              disabled={isRefCodeValid ? false : true}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed disabled:opacity-40 p-2 bg-[#e6cce6]  rounded-lg"
              placeholder={
                !isRefCodeValid ? "please enter reference code" : "$FAIN amount"
              }
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            ></input>
            <div className=" flex flex-col items-center text-xl pt-4">
              <div className="flex  items-center justify-center">
                Total: {calculate(amount)} $FAIN{" "}
                <span>
                  <Image
                    className="pb-1"
                    src="/test4.png"
                    width={32}
                    height={32}
                  ></Image>
                </span>{" "}
              </div>
              <div>Total: {calculateBNB(amount)} $BNB</div>
            </div>
          </div>
          <div className="w-full ">
            <ConnectButton></ConnectButton>

            <button
              onClick={() => buyTokens(amount, ref)}
              disabled={false}
              className="text-black border border-black tracking-widest uppercase bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {calculate(amount) < 12
                ? "Amount must be greater than min"
                : calculate(amount) > 312500
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
