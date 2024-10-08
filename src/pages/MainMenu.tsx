import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import hoverImagePeta from "../assets/FullMap.png";
import ScrollingText from "../components/ScrollingText";
import HoverEffect from "../components/HoverEffect";

const MainMenu: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const img = new Image();
    img.src = hoverImagePeta;
  }, []);

  const handleClick = (path: string) => {
    navigate(path);
  };

  const baseFontSize = 16;
  const goldenRatio = 1.618;

  const h1FontSize = baseFontSize * Math.pow(goldenRatio, 3);
  const pFontSize = baseFontSize;
  const buttonFontSize = baseFontSize * goldenRatio;

  return (
    <HoverEffect image={hoverImagePeta} sectionName="peta">
      <div className="flex flex-col sm:flex-row h-screen bg-gradient-to-br from-gray-100 to-gray-300 dark:from-gray-800 dark:to-gray-900">
        <div className="fixed top-20 w-full z-10 bg-transparent">
          <ScrollingText />
        </div>
        <div className="w-full h-full flex flex-col justify-center items-center bg-white dark:bg-gray-700 relative overflow-hidden border-r border-gray-300 dark:border-gray-700">
          <div className="relative z-10 text-center px-4 pb-2">
            <h1
              className="font-bold text-gray-800 dark:text-gray-200"
              style={{
                fontSize: `${h1FontSize}px`,
                marginBottom: `${baseFontSize * goldenRatio}px`,
              }}
            >
              PETA OKUPASI
            </h1>
            <p
              className="mb-4 max-w-md text-gray-600 dark:text-gray-400"
              style={{
                fontSize: `${pFontSize}px`,
                marginBottom: `${baseFontSize}px`,
              }}
            >
              Temukan informasi terkait okupasi sekolah kejuruan yang ada di
              daerah <span className="font-bold">Sulawesi Utara</span>
            </p>
            <button
              onClick={() => handleClick("/form")}
              className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg shadow-lg transform transition duration-300 hover:bg-gray-900 hover:scale-105"
              style={{ fontSize: `${buttonFontSize}px` }}
            >
              Cari Okupasi
            </button>
          </div>
        </div>
      </div>
    </HoverEffect>
  );
};

export default MainMenu;
