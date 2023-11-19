import Image from "next/image";
import { Josefin_Sans, Outfit } from "next/font/google";
import { useEffect, useState } from "react";
import { useTranslation } from 'next-i18next';
import Web3 from "web3";
import abi from "./contractabi.json";
const jose = Josefin_Sans({ weight: "400", subsets: ["latin"] });
const out = Outfit({ weight: "200", subsets: ["latin"] });
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router'


export default function Home() {
  const router = useRouter()
const { pathname, asPath, query } = router
// change just the locale and maintain all other route information including href's query

  const [progress, setProgress] = useState(0);
  const [isRefCodeValid, setIsRefCodeValid] = useState(false);

  const [walletAddress, setWalletAddress] = useState("");

  const [amount, setAmount] = useState("");
  const [ref, setRef] = useState("");
  const [bnb, setBnb] = useState();
  const { t } = useTranslation();


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
      } catch (err) {
        console.error(err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };
  const contractAddress = "0x54179aE9742BD85a900cBcCf7CbDB35F1Fd626c8";

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
    const web3 = new Web3(window.ethereum);
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
      const web3 = new Web3(window.ethereum); // Assumes MetaMask is used
      const contract = new web3.eth.Contract(abi, contractAddress);

      // Request account access if needed
      await window.ethereum.enable();

      // Get user's account
      const accounts = await web3.eth.getAccounts();
      if (accounts.length === 0) throw new Error("No account found");

      const account = accounts[0];

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
      console.log(requiredBNB / 10 ** 18);
      console.log(refCode);
      // Call the buyTokens function
      await contract.methods
        .buyTokens(amount * 10 ** 18, refCode)
        .send({
          from: account,
          value: requiredBNB,
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
    connectWalletHandler();
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
      className={`flex min-h-screen  tracking-widest flex-col items-center   pb-8 `}
    >
      <Image
        src="/ormblue.png"
        alt="orm"
        className="absolute opacity-50 left-[-80px] block z-0 top-20 "
        width={800}
        height={300}
      ></Image>
      <div className={out.className}>
        <div className={`text-5xl py-12 text-black ${out.className}`}>
          fanly<span className="text-[#C80FB0]">AI</span>
        </div>
      </div>

      <p className={`text-[#C80FB0] text-3xl pb-8  ${out.className}`}>$FAIN private sale</p>

      <div
        className={`flex rounded-xl text-black   filter backdrop-blur-sm ${jose.className} justify-start p-12 items-start border border-gray-300
  w-full md:w-[550px] h-[600px] md:h-[550px]`}
      >
        <div>
          <div className="flex tracking-widest flex-col text-center">
            <p >
            {t('min')} : <span className="text-lg"> 1000 $FAIN</span>{" "}
            </p>
            <p >
            {t('max')} : <span className="text-lg"> 1000000000 $FAIN</span>{" "}
            </p>
            <p >
            {t('price')} :
              <span className="text-lg"> 20.834 FAIN {t('per')} 0.1 $BNB</span>{" "}
            </p>
          </div>
          <div className="pt-4 pb-2 tracking-widest w-full md:w-[450px] text-center flex flex-col justify-center">
            <p className=" tracking-widest py-2">{t('ref')}</p>
            <input
              maxLength={6}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed text-black p-2 bg-[#e6cce6] rounded-lg"
              placeholder={t('placeholderref')}
              onChange={(event) => setRef(event.target.value)}
            ></input>
            <p className=" tracking-widest pb-2 pt-4">
            {t('amount')}
            </p>
            <input
              disabled={isRefCodeValid ? false : true}
              className="w-full placeholder-[#b8a2b8] disabled:cursor-not-allowed disabled:opacity-40 p-2 bg-[#e6cce6]  rounded-lg"
              placeholder={
                !isRefCodeValid ? t('placeholderrefpls'): t('placeholderamount')
              }
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
            ></input>
            <div className=" flex flex-col items-center text-xl pt-4">
              <div className="flex  items-center justify-center">{t('total')}: {calculate(amount)} $FAIN <span><Image className="pb-1" src="/test4.png" width={32} height={32}></Image></span> </div>
              <div>{t('total')}: {calculateBNB(amount)}  $BNB</div>
             
            </div>
          </div>
          <div className="w-full ">
            <button
              disabled={walletAddress ? true : false}
              onClick={connectWalletHandler}
              className="text-black disabled:opacity-40 tracking-widest border border-black  uppercase  bg-white w-full mb-2 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {walletAddress
                ? t('walletshow') + walletAddress.substring(0, 9) + "..."
                : t('wallet')}
            </button>
            <button
              onClick={() => buyTokens(amount, ref)}
              disabled={
                calculate(amount) < 1000 ||
                calculate(amount) > 1000000000 ||
                !isRefCodeValid
                  ? true
                  : false
              }
              className="text-black border border-black tracking-widest uppercase bg-white w-full disabled:opacity-40 disabled:cursor-not-allowed px-4 cursor-pointer py-3 flex justify-center items-center rounded-xl"
            >
              {calculate(amount) < 1000
                ? t('button_min')
                : calculate(amount) > 1000000000
                ? t('button_max')
                : t('button_buy')}
            </button>
            {walletAddress ? (
              " "
            ) : (
              <p className="text-red-600 py-2 flex justify-center">
               {t('wallet')}
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
export const getServerSideProps = async ({ locale }) => ({
  props: {
      ...(await serverSideTranslations(locale, ['common']))
  }
});

