import Section from "../components/Section";
import Heading from "../components/Heading";
import { desktop2, phone_analytics, check, loading } from "../assets";
import Button from "../components/Button";

const Services = () => {
    return (
        <Section id="admin-panel">
            <div className="container">
                <Heading title="Административная панель для менеджеров" text="Все в одном месте: аналитика, метрика и отчеты" />
                <div className="flex justify-center mb-8">
                    <Button onClick={() => window.location.href = 'https://www.figma.com/proto/b9W2pEtG2M3Ae7RdAAqgsb/Design-ZERNO?node-id=239-853&node-type=frame&t=Q7St5Yusz7LZfu19-1&scaling=contain&content-scaling=fixed&page-id=229%3A421&starting-point-node-id=229%3A422/'}>
                        Try Zerno Example
                    </Button>
                </div>
                <div className="relative">
                    <div className="relative z-1 flex flex-col items-center mb-5 p-8 border border-purple-300 rounded-3xl overflow-hidden lg:p-20">
                        <div className="w-full max-w-[20rem] mb-8">
                            <img className="w-full h-auto object-cover" width={800} alt="Phone Mockup" height={730} src={phone_analytics} />
                        </div>

                        <div className="relative z-1 max-w-[17rem] text-center">
                            <h4 className="h4 mb-4">Интерфейс</h4>
                            <ul className="body-2">
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Интуитивно понятный</p>
                                </li>
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Адаптивный</p>
                                </li>
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Высокая производительность</p>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    
                    <div className="relative z-1 flex flex-col items-center mb-5 p-8 border border-purple-300 rounded-3xl overflow-hidden lg:p-20">
                        <div className="w-full max-w-[200rem] mb-8">
                            <img className="w-full h-auto object-cover" width={2000} alt="Phone Mockup" height={2030} src={desktop2} />
                        </div>
                        
                        <div className="relative z-1 max-w-[17rem] text-center">
                            <h4 className="h4 mb-4">Аналитические инструменты</h4>

                            <ul className="body-2">
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Метрики</p>
                                </li>
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Инфографики</p>
                                </li>
                                <li className="flex items-start py-4 border-t border-n-6">
                                    <img width={24} height={24} src={check} />
                                    <p className="ml-4">Отчеты</p>
                                </li>
                            </ul>

                            <div className="flex items-center h-[3.5rem] px-6 bg-n-8/80 rounded-[1.7rem] mt-8 border-purple-300 border text-base">
                                <img className="w-5 h-5 mr-4" src={loading} alt="" />
                                AI generating report
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </Section>
    );
};

export default Services;
