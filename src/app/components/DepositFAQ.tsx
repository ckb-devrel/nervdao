import React, { useState } from "react";

const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="">{question}</h3>
        <span>{isOpen ? "−" : "+"}</span>
      </div>
      {isOpen && <p className="text-gray-400 mt-2">{answer}</p>}
    </div>
  );
};

const DepositFAQ: React.FC = () => {
  const faqs = [
    {
      question: "When can I withdraw my deposit?",
      answer:
        "You can initiate a redemption from Nervos DAO at any time. However, redemptions will only settle when reaching checkpoints. Checkpoints happen every 180-epoch cycle (roughly 30 days) after depositing, so we recommend redeeming near the end of cycles for maximum profit. Once the settlement period ends, you can withdraw your CKB at any time, and you'll receive your initial deposit and all earned compensation.",
    },
    {
      question: "How are compensation calculated for my deposit?",
      answer:
        "Compensation is calculated based on the amount deposited and the duration of the deposit. The longer you keep your CKB in the Nervos DAO, the more compensation you'll earn.",
    },
    {
      question: "What are the benefits of depositing CKB into the Nervos DAO?",
      answer:
        "Depositing CKB into the Nervos DAO allows you to earn compensation and participate in the network's governance. It also helps to secure the network and maintain the value of CKB.",
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl mb-4">FAQ</h2>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default DepositFAQ;
