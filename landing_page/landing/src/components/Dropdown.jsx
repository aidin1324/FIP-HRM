import React, { useState } from 'react';
import Button from './Button';

const Dropdown = ({ className, options, white }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const scrollToSection = (id) => {
        const element = document.querySelector(id);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - 80,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className={`relative inline-block text-left ${className || ""}`}>
            <Button onClick={handleToggle} white={white}>
                Демо-версия
            </Button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                        {options.map((option) => (
                            <a
                                key={option.href}
                                href={option.href}
                                onClick={(e) => {
                                    e.preventDefault();
                                    scrollToSection(option.href);
                                }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                                {option.label}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
