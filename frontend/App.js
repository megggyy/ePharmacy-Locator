import React from 'react';
import { Auth } from './context/Store/Auth'; 
import StackNavigator from './app/navigation/StackNavigator';

const App = () => {
    return (
        <Auth>
            <StackNavigator />
        </Auth>
    );
};

export default App;
