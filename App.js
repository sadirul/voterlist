import { createNativeStackNavigator } from '@react-navigation/native-stack'
import BottomNavigator from './src/BottomNavigator/BottomNavigator'
import { NavigationContainer } from '@react-navigation/native'

const Stack = createNativeStackNavigator()

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="BottomNavigatorr" component={BottomNavigator} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App