import { Plus, Minus, SquarePlus, SquareMinus } from "lucide-react";
import { useState } from "react";
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const FaqAko = ({ data, faqs }) => {
    const [expandedFaqs, setExpandedFaqs] = useState(new Set([4])); // FAQ 4 starts expanded

    const toggleFaq = (id) => {
        const newExpanded = new Set(expandedFaqs);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedFaqs(newExpanded);
    };

    return (
        <section className="pb-10 xl:pb-16 px-primary">
            <div className="flex flex-col bg-white rounded-xl gap-5 md:gap-6">
                
                <h1 className="text-3xl md:text-[40px] 2xl:text-5xl mx-auto 2xl:max-w-7xl font-semibold text-center cusomtext-neutral-dark">
                    <TextWithHighlight text={data?.title} />
                </h1>

                <p className="text-center text-base lg:text-lg 2xl:text-xl cusomtext-neutral-dark max-w-3xl mx-auto">
                        {data?.description}
                </p>

                <div className="flex flex-wrap justify-between">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="  p-2 cursor-pointer w-full md:w-1/2"
                            onClick={() => toggleFaq(faq.id)}
                        >
                            <div className="p-4 rounded-lg shadow-sm bg-[#F7F9FB]">
                                <div className="flex justify-between items-start p-2">
                                    <h3 className="text-lg xl:text-xl 2xl:text-2xl font-medium pr-8">
                                        {faq.question}
                                    </h3>
                                    <button className="customtext-primary flex-shrink-0">
                                        {expandedFaqs.has(faq.id) ? (
                                            <SquareMinus className="w-6 h-6 text-[#FF7F00]" />
                                        ) : (
                                            <SquarePlus className="w-6 h-6 text-[#FF7F00]" />
                                        )}
                                    </button>
                                </div>
                                {expandedFaqs.has(faq.id) && faq.answer && (
                                    <p className="mt-2 p-2 customtext-neutral-dark text-base md:text-lg 2xl:text-xl">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
};
export default FaqAko;
