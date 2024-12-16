import Button from "../components/Button";
import Heading from "../components/Heading";
import Section from "../components/Section";
import Tagline from "../components/Tagline";
import { check2, grid, loading1, gradient, csr, roadmap3, roadmap4 } from "../assets";

const roadmap = [
    // {
    //     id: "0",
    //     title: "Voice recognition",
    //     text: "Enable the chatbot to understand and respond to voice commands, making it easier for users to interact with the app hands-free.",
    //     date: "May 2023",
    //     status: "done",
    //     imageUrl: roadmap1,
    //     colorful: true,
    // },
    {
        id: "1",
        title: "Автоматизация",
        text: "Мы делаем систему умнее: фильтр спама, автоматическое реагирование на негативные отзывы, AI-отчеты — все для вашего удобства и быстрого принятия решений.",
        date: "Февраль 2025",
        status: "progress",
        imageUrl: roadmap3,
        colorful: true,
    },
    {
        id: "2",
        title: "Интеграция с 2ГИС API",
        text: "Отзывы из 2ГИС интегрируются прямо в нашу систему, добавляя ценную аналитику и расширяя возможности для улучшения.",
        date: "Февраль 2025",
        status: "progress",
        imageUrl: roadmap4,
        colorful: true,
    },
    {
        id: "3",
        title: "Экологическая ответственность",
        text: "Alcyone помогает бизнесам быть экологически осознанными, внедряя инструменты для устойчивого ведения дел.",
        date: "Июнь 2025",
        status: "progress",
        imageUrl: csr,
        colorful: true,
    },
];

const Roadmap = () => (
    <Section className="overflow-hidden relative" id="roadmap">
        <div className="container md:pb-10">
            <Heading tag="FIP Alcyone" title="Над чем мы работаем" />

            <div className="relative grid gap-6 md:grid-cols-2 md:gap-4 md:pb-[7rem]">
                {roadmap.map((item) => {
                    const status = item.status === "done" ? "Done" : "In progress";

                    return (
                        <div
                            className={`md:flex even:md:translate-y-[7rem] p-0.25 rounded-[2.5rem] ${
                                item.colorful ? "bg-conic-gradient" : "bg-n-6"
                            }`}
                            key={item.id}
                        >
                            <div className="relative p-8 bg-n-8 rounded-[2.4375rem] overflow-hidden xl:p-15">
                                <div className="absolute top-0 left-0 w-full h-full">
                                    <img className="w-full h-full object-cover" src={grid} alt="" />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between max-w-[27rem] mb-8 md:mb-20">
                                        <Tagline>{item.date}</Tagline>

                                        <div className="flex items-center px-4 py-1 bg-white rounded text-n-8">
                                            <img
                                                className="mr-2.5"
                                                src={item.status === "done" ? check2 : loading1}
                                                width={16}
                                                height={16}
                                                alt={status}
                                            />
                                            <div className="tagline">{status}</div>
                                        </div>
                                    </div>

                                    <div className="mb-10 -my-10 -mx-15">
                                        <img
                                            className="w-full"
                                            src={item.imageUrl}
                                            width={628}
                                            height={426}
                                            alt={item.title}
                                        />
                                    </div>
                                    <h4 className="h4 mb-4">{item.title}</h4>
                                    <p className="body-2 text-n-4">{item.text}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="absolute inset-0 flex justify-center items-center opacity-60 mix-blend-color-dodge pointer-events-none">
                    <img className="w-[58.85rem] h-[58.85rem]" src={gradient} alt="Gradient" />
                </div>
            </div>

            <div className="flex justify-center mt-12 md:mt-15 xl:mt-20">
                <Button href="#roadmap">Our roadmap</Button>
            </div>
        </div>
    </Section>
);

export default Roadmap;
