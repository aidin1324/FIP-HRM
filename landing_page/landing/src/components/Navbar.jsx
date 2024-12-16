// Navbar.jsx
import { useLocation } from "react-router-dom";
import { disablePageScroll, enablePageScroll } from "scroll-lock";
import { useState, useEffect } from "react";
import { logo } from "../assets";
import Button from "./Button";
import MenuSvg from "../assets/svg/MenuSvg";

const navigation = [
    { id: "0", title: "Возможности", url: "#features" },
    { id: "1", title: "Цена", url: "#pricing" },
    { id: "2", title: "Страничка фидбека", url: "#feedback" },
    { id: "3", title: "Окно менеджера", url: "#admin-panel" },
    { id: "4", title: "Roadmap", url: "#roadmap" },
    { id: "5", title: "Связаться с нами", url: "#footer", onlyMobile: true },
];

const scrollToSection = (id) => {
    const element = document.querySelector(id);
    if (element) {
        window.scrollTo({
            top: element.offsetTop - 80,
            behavior: "smooth",
        });
    }
};

const Navbar = () => {
    const { hash } = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    useEffect(() => {
        const mediaQuery = window.matchMedia('(min-width: 1024px)'); // 1024px соответствует классу 'lg' в Tailwind CSS
    
        const handleMediaChange = (e) => {
            if (e.matches && isMenuOpen) {
                closeMenu();
            }
        };
    
        // Добавляем слушатель события изменения медиа-запроса
        mediaQuery.addEventListener('change', handleMediaChange);
    
        return () => {
            mediaQuery.removeEventListener('change', handleMediaChange);
        };
    }, [isMenuOpen]);
    
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
        enablePageScroll();
    };

    return (
        <>
            <header className={`fixed top-0 left-0 w-full z-50 border-b border-n-6 bg-n-8/90 backdrop-blur-sm transition duration-300 ${isMenuOpen ? "bg-n-8" : "bg-n-8/90 backdrop-blur-sm"}`}>
                <div className="flex items-center justify-between px-5 lg:px-7.5 xl:px-10 py-4">
                    {/* Логотип */}
                    <a className="flex items-center w-[12rem] xl:mr-8" href="#hero" onClick={() => scrollToSection("#hero")}>
                        <img src={logo} width={40} height={40} alt="Logo" className="mr-2" />
                        <span className="text-xl font-bold text-white">Alcyone</span>
                    </a>

                    {/* Горизонтальное меню для больших экранов */}
                    <nav className="hidden lg:flex space-x-8">
                        {navigation.filter(item => !item.onlyMobile).map((item) => (
                            <a
                                key={item.id}
                                href={item.url}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(item.url);
                                }}
                                className={`font-code uppercase text-white transition-colors duration-300 ${
                                    item.url === hash ? "text-color-1 font-semibold" : "text-white/50 hover:text-color-1"
                                }`}
                            >
                                {item.title}
                            </a>
                        ))}
                    </nav>

                    {/* Кнопка "Связаться с нами" для больших экранов */}
                    <div className="hidden lg:block">
                        <Button href="#footer" className="text-white bg-color-1 hover:bg-color-1/80 transition-colors duration-300">
                            Связаться с нами
                        </Button>
                    </div>

                    {/* Кнопка меню для мобильных устройств */}
                    <button
                        onClick={toggleMenu}
                        className="lg:hidden text-white focus:outline-none"
                        aria-label="Toggle Menu"
                        aria-expanded={isMenuOpen}
                        aria-controls="mobile-menu"
                    >
                        <MenuSvg open={isMenuOpen} />
                    </button>
                </div>
            </header>

            {/* Off-Canvas Меню */}
            <div className={`fixed inset-0 z-40 transform ${isMenuOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-300 ease-in-out bg-n-8 w-3/4 max-w-xs lg:hidden`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-n-6">
                    <a className="flex items-center w-[12rem] xl:mr-8" href="#hero" onClick={() => { scrollToSection("#hero"); closeMenu(); }}>
                        <img src={logo} width={40} height={40} alt="Logo" className="mr-2" />
                        <span className="text-xl font-bold text-white">Alcyone</span>
                    </a>
                    <button onClick={closeMenu} className="text-white focus:outline-none">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <nav className="flex flex-col mt-8 space-y-4 px-5">
                    {navigation.map((item) => (
                        <a
                            key={item.id}
                            href={item.url}
                            onClick={(e) => {
                                e.preventDefault();
                                scrollToSection(item.url);
                                closeMenu();
                            }}
                            className={`font-code text-2xl uppercase text-white transition-colors duration-300 ${
                                item.url === hash
                                    ? "text-color-1 font-semibold"
                                    : "text-white/50 hover:text-color-1"
                            }`}
                        >
                            {item.title}
                        </a>
                    ))}
                </nav>
            </div>

            {/* Фоновый оверлей при открытом меню */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300"
                    onClick={closeMenu}
                ></div>
            )}
        </>
    );
};

export default Navbar;