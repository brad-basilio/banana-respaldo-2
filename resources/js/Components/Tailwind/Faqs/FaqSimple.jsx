import { Plus, Minus, SquarePlus, SquareMinus } from "lucide-react";
import { useState } from "react";

const FaqSimple = ({ faqs }) => {
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
        <section className="bg-[#F7F9FB] pb-12 px-primary">
            <div className="mx-auto    2xl:max-w-7xl gap-12 bg-white rounded-xl p-4 md:p-8">
                <h1 className="text-[40px] font-bold text-center mb-4 cusomtext-neutral-dark">
                    Preguntas frecuentes
                </h1>
               {/* <p className="text-center  cusomtext-neutral-light mb-12 max-w-3xl mx-auto">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Vivamus eu fermentum justo, ac fermentum nulla. Sed sed
                    scelerisque urna, vitae ultricies libero. Pellentesque
                    vehicula et urna in venenatis.
                </p> */}

                <div className="flex flex-wrap justify-between">
                    {faqs.map((faq) => (
                        <div
                            key={faq.id}
                            className="  p-2 cursor-pointer w-full md:w-1/2"
                            onClick={() => toggleFaq(faq.id)}
                        >
                            <div className="p-4 rounded-lg shadow-sm bg-[#F7F9FB]">
                                <div className="flex justify-between items-start p-4">
                                    <h3 className="text-lg font-semibold pr-8">
                                        {faq.question}
                                    </h3>
                                    <button className="customtext-primary flex-shrink-0">
                                        {expandedFaqs.has(faq.id) ? (
                                            <SquareMinus className="w-6 h-6" />
                                        ) : (
                                            <SquarePlus className="w-6 h-6" />
                                        )}
                                    </button>
                                </div>
                                {expandedFaqs.has(faq.id) && faq.answer && (
                                    <p className="mt-4 p-4 customtext-neutral-light text-base">
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
export default FaqSimple;
