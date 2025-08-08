import { Tag } from "lucide-react";

const BannerBananaLab = ({ data }) => {
    return (
        <div className=" px-primary 2xl:px-0 2xl:max-w-7xl mx-auto font-paragraph py-10 lg:py-10">
            <div
                className="relative  rounded-3xl md:rounded-2xl h-[630px] lg:h-[450px] p-4 md:p-0"
                style={{
                    backgroundImage: `url(/storage/images/system/${data?.background})`,
                    backgroundSize: "cover",
                    backgroundPosition: "right",
                    backgroundRepeat: "no-repeat",
                }}
            >
                <div className="flex flex-col  md:flex-row items-center justify-between h-full gap-8 ">
                    {/* Left side - Image */}
                    <div className="order-1 md:order-none w-full md:w-7/12 relative z-10">
                        <img
                            src={`/storage/images/system/${data?.image}`}
                            className="absolute bottom-0 w-full h-[280px] object-cover md:absolute scale-110 lg:scale-100 lg:-top-6 lg:-translate-y-1/2 lg:h-[500px] 2xl:-right-10 "
                        />
                    </div>

                    {/* Right side - Content */}
                    <div className="md:order-1 md:w-5/12 xl:w-7/12 text-white z-20 ">
                        <div className="max-w-sm 2xl:max-w-lg">
                            <h1 className="text-[32px] leading-[1.2]  font-semibold mb-2 lg:text-4xl ">
                                {data?.name}
                            </h1>
                            <p className="text-[14.2px] mb-7 ">
                                {data?.description}
                            </p>
                            <a
                                href={data?.button_link}
                                className="bg-primary cursor-pointer font-semibold text-base w-max  text-white px-6 py-2 rounded-full  hover:opacity-90 transition-all duration-300 flex items-center gap-2"
                            >
                                {data?.button_text}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default BannerBananaLab;
