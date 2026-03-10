import React from "react";
import { useTranslation } from "react-i18next";

const FAQItem: React.FC<{ question: string; answer: string }> = ({
  question,
  answer,
}) => {
  return (
    <div className="mb-4">
      <h3 className="flex justify-between items-center font-bold">
        {question}
      </h3>
      <p className="text-gray-400 mt-2">{answer}</p>
    </div>
  );
};

const DepositFAQ: React.FC = () => {
  const { t } = useTranslation();
  const faqs = [
    {
      question: t("depositFaq.q1"),
      answer: t("depositFaq.a1"),
    },
    {
      question: t("depositFaq.q2"),
      answer: t("depositFaq.a2"),
    },
    {
      question: t("depositFaq.q3"),
      answer: t("depositFaq.a3"),
    },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 flex-1 self-start">
      <h2 className="text-2xl mb-4">{t("depositFaq.faq")}</h2>
      {faqs.map((faq, index) => (
        <FAQItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default DepositFAQ;
