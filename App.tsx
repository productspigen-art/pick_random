import React, { useState, useCallback } from 'react';

// Icons defined as components outside the main App to prevent re-creation on render
const PlayIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
);

const ResetIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
        <path d="M21 3v5h-5"></path>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
        <path d="M3 21v-5h5"></path>
    </svg>
);

// --- New Feature: Effects ---
interface Effect {
    text: string;
    auraClass: string;
}

interface NameEntry {
    name: string;
    effect?: Effect;
}

const effects: Effect[] = [
    { text: '운 +10%', auraClass: 'shadow-yellow-400/50 shadow-[0_0_20px_theme(colors.yellow.400)]' },
    { text: '불안감이 스멀스멀..', auraClass: 'shadow-purple-500/50 shadow-[0_0_20px_theme(colors.purple.500)]' },
    { text: '느낌이 좋아!', auraClass: 'shadow-cyan-400/50 shadow-[0_0_20px_theme(colors.cyan.400)]' },
    { text: '안전지대?', auraClass: 'shadow-blue-300/50 shadow-[0_0_20px_theme(colors.blue.300)]' },
    { text: '헉!', auraClass: 'shadow-red-500/50 shadow-[0_0_20px_theme(colors.red.500)]' },
];
// --- End New Feature ---

const Confetti: React.FC = () => {
    const confettiCount = 100;
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];

    return (
        <div className="confetti-container">
            {Array.from({ length: confettiCount }).map((_, i) => (
                <div
                    key={i}
                    className="confetti"
                    style={{
                        left: `${Math.random() * 100}%`,
                        backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                        animationDelay: `${Math.random() * 5}s`,
                        animationDuration: `${3 + Math.random() * 2}s`,
                        transform: `rotate(${Math.random() * 360}deg)`
                    }}
                ></div>
            ))}
        </div>
    );
};


function App() {
    const [names, setNames] = useState<NameEntry[]>([]);
    const [inputValue, setInputValue] = useState<string>('');
    const [isSpinning, setIsSpinning] = useState<boolean>(false);
    const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
    const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [showWinnerModal, setShowWinnerModal] = useState<boolean>(false);

    const handleAddNames = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!inputValue.trim()) return;
        setShowWinnerModal(false);

        const newNameStrings = inputValue
            .split(/[,、\s]+/)
            .map(name => name.trim())
            .filter(name => name.length > 0);

        if (newNameStrings.length > 0) {
            const newNameEntries: NameEntry[] = newNameStrings.map(name => {
                // 10% chance to add an effect
                if (Math.random() < 0.1) {
                    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
                    return { name, effect: randomEffect };
                }
                return { name };
            });

            setNames(prevNames => [...prevNames, ...newNameEntries]);
            setInputValue('');
            setWinnerIndex(null);
            setErrorMessage('');
        }
    };
    
    const handleSpin = useCallback(() => {
        if (names.length < 2) {
            setErrorMessage('이름을 2명 이상 추가해주세요!');
            return;
        }
        if (isSpinning) return;

        setIsSpinning(true);
        setWinnerIndex(null);
        setShowWinnerModal(false);
        setErrorMessage('');

        const spinDuration = 5000;
        const startTime = Date.now();
        
        const spinAnimation = () => {
            const elapsedTime = Date.now() - startTime;
            if (elapsedTime >= spinDuration) {
                // Time's up, pick the winner
                setIsSpinning(false);
                setHighlightedIndex(null);
                const finalWinnerIndex = Math.floor(Math.random() * names.length);
                setWinnerIndex(finalWinnerIndex);
                setShowWinnerModal(true);
                return;
            }

            // Pick a random person to highlight
            setHighlightedIndex(prevIndex => {
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * names.length);
                } while (names.length > 1 && newIndex === prevIndex);
                return newIndex;
            });
            
            // Calculate the next interval, making it longer as time progresses
            const progress = elapsedTime / spinDuration;
            const maxInterval = 400;
            const minInterval = 50;
            const currentInterval = minInterval + (maxInterval - minInterval) * Math.pow(progress, 3);

            setTimeout(spinAnimation, currentInterval);
        };

        spinAnimation(); // Start the animation loop

    }, [names.length, isSpinning]);

    const handleReset = () => {
        setNames([]);
        setInputValue('');
        setIsSpinning(false);
        setHighlightedIndex(null);
        setWinnerIndex(null);
        setErrorMessage('');
        setShowWinnerModal(false);
    };
    
    const removeName = (indexToRemove: number) => {
        if(isSpinning) return;
        setNames(names.filter((_, index) => index !== indexToRemove));
        if (winnerIndex !== null) {
            setWinnerIndex(null);
        }
        setShowWinnerModal(false);
    };
    
    const displayCount = Math.max(6, names.length);

    return (
        <div className="relative min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans antialiased">
            <div className="w-full max-w-2xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-rose-500 text-transparent bg-clip-text mb-2">
                        걸려 걸려 걸림판
                    </h1>
                    <p className="text-slate-400 text-lg">커피값, 밥값 내기! 운명의 주인공은?</p>
                    <p className="text-slate-500 text-sm mt-1">만약 특별한 문구가 보인다면 기분탓입니다.</p>
                </header>

                <main>
                    <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-xl shadow-2xl mb-8 border border-slate-700">
                        <form onSubmit={handleAddNames} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                placeholder="이름을 쉼표, 공백으로 구분하여 입력 (예: 홍길동, 이순신)"
                                className="flex-grow bg-slate-700 text-white placeholder-slate-400 px-4 py-3 rounded-lg border-2 border-slate-600 focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/50 outline-none transition-all"
                                disabled={isSpinning}
                            />
                            <button
                                type="submit"
                                className="bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-6 py-3 rounded-lg transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                                disabled={isSpinning || !inputValue.trim()}
                            >
                                추가하기
                            </button>
                        </form>
                    </div>
                    
                    {errorMessage && <p className="text-red-400 text-center mb-4 animate-pulse">{errorMessage}</p>}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8 min-h-[100px]">
                       {Array.from({ length: displayCount }).map((_, index) => {
                            const nameEntry = names[index];
                            const hasName = nameEntry !== undefined;

                            return hasName ? (
                                <div
                                    key={index}
                                    className={`relative flex flex-col items-center justify-center p-4 h-24 rounded-lg shadow-lg text-center break-words transition-all duration-200 ease-in-out
                                    ${
                                        winnerIndex === index
                                            ? 'bg-rose-600 text-white scale-110 shadow-rose-500/50 animate-pulse z-20 border-2 border-rose-400'
                                            : isSpinning && highlightedIndex === index
                                            ? 'bg-yellow-400 text-slate-900 scale-110 z-10 border-2 border-yellow-200'
                                            : 'bg-slate-700 text-slate-200 border-2 border-slate-600'
                                    }
                                    ${nameEntry.effect ? nameEntry.effect.auraClass : ''}
                                    `}
                                >
                                    <span className="font-bold text-xl">{nameEntry.name}</span>
                                    {nameEntry.effect && (
                                        <small className="mt-1 text-xs opacity-90 font-medium animate-pulse">{nameEntry.effect.text}</small>
                                    )}

                                    {!isSpinning && (
                                         <button 
                                             onClick={() => removeName(index)}
                                             className="absolute top-1 right-1 bg-slate-800/50 text-white/70 hover:bg-red-500/80 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-mono transition-colors"
                                             aria-label={`${nameEntry.name} 제거`}
                                         >
                                             X
                                         </button>
                                    )}
                                </div>
                            ) : (
                                <div
                                    key={index}
                                    className="flex items-center justify-center p-4 h-24 rounded-lg text-center font-bold text-3xl text-slate-600 border-2 border-dashed border-slate-700 bg-slate-800/50"
                                >
                                    <span>+</span>
                                </div>
                            );
                       })}
                    </div>

                    <div className="flex justify-center items-center gap-4">
                        <button
                            onClick={handleSpin}
                            disabled={isSpinning || names.length < 2}
                            className="flex items-center justify-center gap-2 w-48 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            <PlayIcon />
                            돌리기!
                        </button>
                        <button
                            onClick={handleReset}
                            disabled={isSpinning}
                            className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold px-6 py-4 rounded-full shadow-md transform hover:scale-105 transition-all duration-300 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none"
                        >
                            <ResetIcon />
                            초기화
                        </button>
                    </div>
                </main>
            </div>
            {showWinnerModal && winnerIndex !== null && (
                <div 
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in"
                    onClick={() => setShowWinnerModal(false)}
                >
                    <div 
                        className="relative bg-slate-800 border-2 border-yellow-400 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center transform animate-scale-up overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Confetti />
                        <span className="text-5xl mb-4 block" role="img" aria-label="Party Popper">🎉</span>
                        <h2 className="text-2xl font-bold text-slate-300 mb-2">당첨!</h2>
                        <p className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-yellow-400 to-rose-500 text-transparent bg-clip-text py-2 break-words">
                            {names[winnerIndex].name}
                        </p>
                        <p className="text-slate-400 mt-4">오늘의 주인공은 바로 당신!</p>
                        <button
                            onClick={() => setShowWinnerModal(false)}
                            className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold px-8 py-3 rounded-lg transition-colors"
                        >
                            확인
                        </button>
                    </div>
                </div>
            )}
            <footer className="absolute bottom-4 text-center text-slate-500 text-xs">
                <p>제작: JH Tech | 누가 사지? 운명에 맡겨 보세요!</p>
            </footer>
        </div>
    );
}

export default App;
