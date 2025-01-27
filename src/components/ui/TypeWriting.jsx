import React, { useState, useEffect } from "react";

const TypeWriting = () => {
   const [text, setText] = useState("");
   const [isDeleting, setIsDeleting] = useState(false);
   const [loopNum, setLoopNum] = useState(0);
   const [typingSpeed, setTypingSpeed] = useState(150);

   const phrases = [
      "AI-Powered Resume Builder",
      "Customize to Job-Description",
      "AI Master Resume Generator",
      "Smart AI Resume Assistant",
   ];

   const period = 400;

   useEffect(() => {
      const ticker = setInterval(() => {
         tick();
      }, typingSpeed);

      return () => clearInterval(ticker);
   }, [text, isDeleting]);

   const tick = () => {
      const i = loopNum % phrases.length;
      const fullText = phrases[i];
      const updatedText = isDeleting
         ? fullText.substring(0, text.length - 1)
         : fullText.substring(0, text.length + 1);

      setText(updatedText);

      if (isDeleting) {
         setTypingSpeed((prevSpeed) => prevSpeed / 2);
      }

      if (!isDeleting && updatedText === fullText) {
         setTimeout(() => {
            setIsDeleting(true);
            setTypingSpeed(30);
         }, period);
      } else if (isDeleting && updatedText === "") {
         setIsDeleting(false);
         setLoopNum(loopNum + 1);
         setTypingSpeed(60);
      }
   };

   return (
      <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-pink-900">
         {text}
         <span className="animate-blink">|</span>
      </h1>
   );
};

export default TypeWriting;
