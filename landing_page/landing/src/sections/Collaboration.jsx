import { gradient, check, feedback_intro, discord, figma, framer, notion, photoshop, protopie, raindrop, slack } from "../assets";
import Button from "../components/Button";
import Section from "../components/Section";

const collabContent = [
    {
        title: "Уникальный дизайн",
        text: "Каждый бизнес имеется свои ценности, и мы поможем вам передать их через дизайн.",
    },
    { 
        title: "Простота и быстрота",
        text: "Короткая и удобная форма, чтобы гости могли оставить отзыв за 1-2 минуты.",
    },
    { title: "Интерактивные элементы" },
];

const Collaboration = () => {
    return (
        <Section crosses id="feedback">
            <div className="container lg:flex">
                <div className="max-w-[25rem]">
                    <h2 className="h2 mb-4 md:mb-8" id="feedback h">Страница обратной связи для гостей</h2>

                    <ul className="max-w-[22rem] mb-10 md:mb-14">
                        {collabContent.map((item, i) => (
                            <li className="mb-3 py-3" key={i}>
                                <div className="flex items-center">
                                    <img src={check} width={24} height={24} alt="" />
                                    <h6 className="body-2 ml-5">{item.title}</h6>
                                </div>
                                {item.text && <p className="body-2 mt-3 text-n-4">{item.text}</p>}
                            </li>
                        ))}
                    </ul>

                    <Button onClick={() => window.location.href = 'http://167.172.76.226:3001/'}>
                        Try Zerno Example
                    </Button>

                </div>

                <div className="relative lg:ml-auto xl:w-[38rem] mt-4">
                    <img
                        src={gradient}
                        className="absolute inset-0 w-10% h-10% object-cover"
                        alt="Gradient Background"
                    />
                    <img
                        src={feedback_intro}
                        className="relative object-cover w-140 h-132 rounded-md shadow-sm"
                        alt="Описание изображения"
                    />
                </div>
            </div>
        </Section>
    );
};

export default Collaboration;
