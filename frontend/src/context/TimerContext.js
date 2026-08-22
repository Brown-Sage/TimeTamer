import { createContext, useContext } from 'react';

export const TimerContext = createContext();

export function useTimer() {
    const context = useContext(TimerContext);
    if (!context) {
        throw new Error('useTimer must be used within a TimerProvider');
    }
    return context;
}
