import Router, { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import Header from "../../../components/Header/Header";
import useMetaKey from "../../../hooks/useMetaKey";
import { motion, useAnimationControls } from "framer-motion";

export default function Diary() {
  const [diaryText, setDiaryText] = useState("");
  const [diaryEvaluation, setDiaryEvaluation] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef();
  const router = useRouter();
  const evaluateButtonControls = useAnimationControls();
  const textAreaControls = useAnimationControls();

  let buttonRef = useRef();

  useMetaKey(() => {
    buttonRef.current.dispatchEvent(
      new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        buttons: 1,
      })
    );
  }, inputRef);

  const analyse = () => {
    console.log("analysing");
    setErrorMessage("");
    setDiaryText(null);
    setDiaryEvaluation(null);
    const url =
      "https://text-analysis12.p.rapidapi.com/sentiment-analysis/api/v1.1";

    const apiParams = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "X-RapidAPI-Key": "00b3000128mshefea4c98308e802p13efd7jsnb129a7ffac9c",
        "X-RapidAPI-Host": "text-analysis12.p.rapidapi.com",
      },
      body: `{"language":"english","text":"${diaryText}"}`,
    };

    fetch(url, apiParams)
      .then((res) => res.json())
      .then((json) => {
        setDiaryEvaluation(json);
        setErrorMessage("");
        router.push(
          `/GetHelp/Diary/Results?results=${json.aggregate_sentiment.compound}`,
          `/GetHelp/Diary`,
          { shallow: true }
        );
      })
      .catch((err) => {
        setErrorInEval({
          error: true,
          description: err,
        });
      });
  };

  // const feedbackToEmotion = (e) => {
  //   if (e == null) {
  //     return "";
  //   } else if (e < -0.5) {
  //     return "Looks like your day wasn't great, but that's ok. We all have bad days :)";
  //   } else if (e < 0) {
  //     return "a bit bad";
  //   } else if (e < 0.5) {
  //     return "a bit good";
  //   } else if (e < 1) {
  //     return "Seems like you've had a great day";
  //   }
  // };

  useEffect(() => {
    if (diaryText === null || diaryText === "") {
      evaluateButtonControls.start({
        backgroundColor: "#DED4D4",
        transition: {
          scaleX: 0,
          ease: "linear",
        },
      });
    } else {
      evaluateButtonControls.start({ backgroundColor: "#CAEAC2" });
    }
  }, [diaryText]);
  console.log(errorMessage);
  return (
    <div>
      <Header tab="Get Help" />
      <main className="bg-[#fff] p-10">
        <div className="flex flex-col lg:flex-row items-start justify-start w-full h-full">
          <p className="text-lg lg:text-4xl md:text-2xl sm:text-xl font-medium font-Inter text-green-700 w-max">
            In less than a hundred words,
          </p>
          <p className="text-lg lg:text-4xl md:text-2xl sm:text-xl font-Inter grow lg:ml-2 w-max">
            write about how your day went.
          </p>
        </div>
        <motion.textarea
          className={
            errorMessage !== ""
              ? "w-[100%] h-[50vh] p-5 border-none outline-none bg-[#CAEAC2] mt-4 rounded-xl placeholder:text-red-500"
              : "w-[100%] h-[50vh] p-5 border-none outline-none bg-[#CAEAC2] mt-4 rounded-xl placeholder:text-slate-400"
          }
          onChange={(e) => setDiaryText(e.target.value)}
          placeholder={
            errorMessage !== ""
              ? "*This field is required"
              : "Start writing here..."
          }
          ref={inputRef}
          animate={textAreaControls}
        />
        <div className="flex items-center justify-center w-full">
          <motion.button
            className="bg-[#DED4D4] w-36 h-10 rounded-full m-auto font-semibold mt-5"
            onClick={() => {
              if (diaryText === "") {
                setErrorMessage("Textarea empty");
                setIsLoading(false);
                textAreaControls.start({ x: [-7, 7, -7, 7, -7, 0] });
              } else {
                analyse();
                setIsLoading(true);
                setErrorMessage("");
              }
            }}
            ref={buttonRef}
            animate={evaluateButtonControls}
          >
            {isLoading ? "Evaluating..." : "Evaluate"}
          </motion.button>
        </div>
        <div>
          <div className="flex items-center justify-center mt-4 sm:flex sm:items-start sm:justify-start">
            <p
              className="text-md lg:text-xl md:text-lg font-lora underline w-fit"
              // onMouseEnter={() => setShowPrivacyInfo(true)}
              // onMouseLeave={() => setShowPrivacyInfo(false)}
            >
              Where is my data stored?
            </p>
          </div>
          <p className="text-sm lg:text-lg md:text-md font-lora">
            We store everything about you in <strong>your device itself</strong>
            , no one else has access to it. Once you click the "Evaluate"
            button, we <strong>permanently delete</strong> your diary entry from
            all our databases, and just save the score. Even the score is saved
            only on your device, not on our servers.
          </p>
        </div>
      </main>
    </div>
  );
}