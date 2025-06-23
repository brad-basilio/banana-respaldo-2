import React from "react"
import { motion } from "framer-motion";
import TextWithHighlight from "../../../Utils/TextWithHighlight";

const AboutAko = ({ data, filteredData, items }) => {

    const banner = items?.find((item) => item.correlative === "banner");
    const titleSecond = items?.find((item) => item.correlative === "title_second");
    const cardOne = items?.find((item) => item.correlative === "card_one");
    const cardTwo = items?.find((item) => item.correlative === "card_two");
    const cardThree = items?.find((item) => item.correlative === "card_three");
    const cardFour = items?.find((item) => item.correlative === "card_four");
    const titleMision = items?.find((item) => item.correlative === "title_mision");
    const titleVision = items?.find((item) => item.correlative === "title_vision");
    const imageVisionMision = items?.find((item) => item.correlative === "image_vision_mision");
   
    const fadeInUp = {
        initial: { opacity: 0, y: 60 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <main className="min-h-screen bg-white px-primary w-full py-10 md:py-14">
            
            {/* Hero Section */}
            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <motion.div 
                    variants={fadeInUp}
                    className="w-full rounded-2xl overflow-hidden"
                >
                    <img
                        src={`/storage/images/aboutus/${banner?.image}`}
                        onError={(e) => (e.target.src = "/api/cover/thumbnail/null")}
                        alt={banner?.title}
                        className="w-full h-[300px] md:h-[400px] 2xl:h-[500px] object-cover"
                    />
                </motion.div>
            </motion.section>

            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="py-10 xl:py-16"
            >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl text-center font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                    <TextWithHighlight text={banner?.title} />
                </motion.h2>
            </motion.section>


            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
            >
                <motion.div variants={fadeInUp}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 customtext-neutral-dark text-base md:text-lg"
                        dangerouslySetInnerHTML={{
                            __html: banner?.description?.replace(/<p><br><\/p>/g, '') || ''
                          }}  
                    />
                </motion.div>
            </motion.section>


            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="py-10 xl:py-16"
            >
                <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl lg:text-[40px] 2xl:text-5xl font-medium tracking-normal customtext-neutral-dark leading-tight font-title">
                    <TextWithHighlight text={titleSecond?.title} />
                </motion.h2>
            </motion.section>            

            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className=""
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 xl:gap-10 font-title">

                    <div className="flex flex-col gap-3 justify-around 2xl:gap-10 2xl:justify-center">
                        <div className="flex flex-col gap-4 items-start min-w-[240px] bg-[#F2F2F2] group hover:bg-secondary rounded-xl p-6">
                            <div className="rounded-full w-14 h-14 flex flex-row justify-center items-center">
                                <div className='bg-[#FF7F00] rounded-full overflow-hidden'>
                                    <img
                                        src={`/storage/images/aboutus/${cardOne?.image}`}
                                        alt={cardOne?.title}
                                        className="w-14 h-14 object-contain p-2" 
                                        onError={e => e.target.src = '/assets/img/noimage/noicon.png'}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col customtext-neutral-dark gap-4">
                                <h2 className="text-xl xl:text-2xl !leading-none font-medium group-hover:text-white">{cardOne?.title}</h2>
                                <p className="text-base xl:text-lg 2xl:text-xl !leading-tight group-hover:text-white">
                                    {cardOne?.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 items-start min-w-[240px] bg-[#F2F2F2] group hover:bg-secondary rounded-xl p-6">
                            <div className="rounded-full w-14 h-14 flex flex-row justify-center items-center">
                                <div className='bg-[#FF7F00] rounded-full overflow-hidden'>
                                    <img
                                        src={`/storage/images/aboutus/${cardThree?.image}`}
                                        alt={cardThree?.title}
                                        className="w-14 h-14 object-contain p-2" 
                                        onError={e => e.target.src = '/assets/img/noimage/noicon.png'}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col customtext-neutral-dark gap-4">
                                <h2 className="text-xl xl:text-2xl !leading-none font-medium group-hover:text-white">{cardThree?.title}</h2>
                                <p className="text-base xl:text-lg 2xl:text-xl !leading-tight group-hover:text-white">
                                    {cardThree?.description}
                                </p>
                            </div>
                        </div>
                    </div> 

                    <div className="flex sm:hidden lg:flex flex-col items-center justify-center">
                        <img
                            src={`/storage/images/aboutus/${titleSecond?.image}`}
                            onError={(e) => (e.target.src = "/api/cover/thumbnail/null")}
                            alt={titleSecond?.title}
                            className="w-full h-[300px] max-h-[600px] md:h-full object-cover rounded-xl"
                        />
                    </div>

                    <div className="flex flex-col gap-3  justify-around 2xl:gap-10 2xl:justify-center">
                        <div className="flex flex-col gap-4 items-start min-w-[240px] bg-[#F2F2F2] group hover:bg-secondary rounded-xl p-6">
                            <div className="rounded-full w-14 h-14 flex flex-row justify-center items-center">
                                <div className='bg-[#FF7F00] rounded-full overflow-hidden'>
                                    <img
                                        src={`/storage/images/aboutus/${cardTwo?.image}`}
                                        alt={cardTwo?.title}
                                        className="w-14 h-14 object-contain p-2" 
                                        onError={e => e.target.src = '/assets/img/noimage/noicon.png'}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col customtext-neutral-dark gap-4">
                                <h2 className="text-xl xl:text-2xl !leading-none font-medium group-hover:text-white">{cardTwo?.title}</h2>
                                <p className="text-base xl:text-lg 2xl:text-xl !leading-tight group-hover:text-white">
                                    {cardTwo?.description}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 items-start min-w-[240px] bg-[#F2F2F2] group hover:bg-secondary rounded-xl p-6">
                            <div className="rounded-full w-14 h-14 flex flex-row justify-center items-center">
                                <div className='bg-[#FF7F00] rounded-full overflow-hidden'>
                                    <img
                                        src={`/storage/images/aboutus/${cardFour?.image}`}
                                        alt={cardFour?.title}
                                        className="w-14 h-14 object-contain p-2" 
                                        onError={e => e.target.src = '/assets/img/noimage/noicon.png'}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col customtext-neutral-dark gap-4">
                                <h2 className="text-xl xl:text-2xl !leading-none font-medium group-hover:text-white">{cardFour?.title}</h2>
                                <p className="text-base xl:text-lg 2xl:text-xl !leading-tight group-hover:text-white">
                                    {cardFour?.description}
                                </p>
                            </div>
                        </div>
                    </div>   

                </div>
            </motion.section>  

            
            <motion.section 
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="pt-12 md:pt-16"
            >
                <div className="">
                    <motion.div variants={fadeInUp} className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                        <img
                            src={`/storage/images/aboutus/${imageVisionMision?.image}`}
                            onError={(e) => (e.target.src = "/api/cover/thumbnail/null")}
                            alt={imageVisionMision?.title}
                            className="w-full h-[300px] md:h-auto object-cover rounded-2xl"
                        />
                        <div className="flex flex-col justify-center gap-6 2xl:gap-8">
                            <div className="flex flex-col gap-2 2xl:gap-4">
                                <h2 className="text-2xl md:text-3xl 2xl:text-4xl font-semibold customtext-neutral-dark">
                                    <TextWithHighlight text={titleMision?.title} />
                                </h2>
                                <div
                                    className="customtext-neutral-dark text-base md:text-lg 2xl:text-xl prose"
                                    dangerouslySetInnerHTML={{
                                        __html: titleMision?.description,
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2 2xl:gap-4">
                                <h2 className="text-2xl md:text-3xl 2xl:text-4xl font-semibold customtext-neutral-dark">
                                    <TextWithHighlight text={titleVision?.title} />
                                </h2>
                                <div
                                    className="customtext-neutral-dark text-base md:text-lg 2xl:text-xl prose"
                                    dangerouslySetInnerHTML={{
                                        __html: titleVision?.description,
                                    }}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.section>

        </main>
    )
}

export default AboutAko