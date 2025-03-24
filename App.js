import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, ScrollView, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { TextInput, Button, Appbar, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import axios from 'axios';

const App = () => {
  const [amount, setAmount] = useState('00.00');
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [currencySymbols, setCurrencySymbols] = useState([]); // Add state for currency symbols

  // Function to load currency symbols from the API
  const loadCurrencies = async () => {
    try {
      const apiKey = 'db721120d4ecf62a898fc5599feabcfb'; // Replace with your actual API key
      const baseUrl = `https://api.exchangeratesapi.io/v1/symbols?access_key=${apiKey}`;
      const response = await axios.get(baseUrl);
      setCurrencySymbols(Object.entries(response.data.symbols).map(([code, name]) => ({
        label: `${name} [${code}]` ,
        value: code
      })));
    } catch (error) {
      console.error('Error fetching currency symbols:', error.message);
      Alert.alert(
          'Error',
          error.message,
          [{ text: 'OK' }],
          { cancelable: false }
      );
    }
  };

  // Function to convert currency
  const convertCurrency = async () => {
    try {
      const apiKey = 'db721120d4ecf62a898fc5599feabcfb'; // Replace with your actual API key
      const baseUrl = `https://api.exchangeratesapi.io/v1/latest?access_key=${apiKey}`;
      const response = await axios.get(baseUrl);
      setConvertedAmount(parseFloat(calCurrency(baseCurrency, targetCurrency, amount, response.data.rates)));
    } catch (error) {
      console.error('Error fetching exchange rates:', error.message);
      Alert.alert(
          'Error',
          error.message,
          [{ text: 'OK' }],
          { cancelable: false }
      );
    }
  };

  const calCurrency = (baseCurrency, targetCurrency, amount, rateList) => {
    const baseToEurRate = rateList[baseCurrency];
    const targetToEurRate = rateList[targetCurrency];
    if (!baseToEurRate || !targetToEurRate) {
      throw new Error('Currency not found in the rate list');
    }
    const amountInEur = amount / baseToEurRate;
    const amountInTargetCurrency = amountInEur * targetToEurRate;
    return amountInTargetCurrency;
  }

  useEffect(() => {
    loadCurrencies(); // Load currencies when the component mounts
  }, []);
  
  return (
      <SafeAreaProvider>
        <KeyboardAvoidingView style={styles.container} behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
              <Appbar.Header>
                <Appbar.Content title="Currency Converter" />
              </Appbar.Header>

              <TextInput
                  label="Enter amount"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  style={styles.input}
              />

              <Picker
                  selectedValue={baseCurrency}
                  onValueChange={(itemValue) => setBaseCurrency(itemValue)}
                  style={styles.picker}
              >
                {currencySymbols.map((currency) => (
                    <Picker.Item key={currency.value} label={currency.label} value={currency.value} />
                ))}
              </Picker>

              <Picker
                  selectedValue={targetCurrency}
                  onValueChange={(itemValue) => setTargetCurrency(itemValue)}
                  style={styles.picker}
              >
                {currencySymbols.map((currency) => (
                    <Picker.Item key={currency.value} label={currency.label} value={currency.value} />
                ))}
              </Picker>

              <Button mode="contained" onPress={convertCurrency} style={styles.button}>
                Convert
              </Button>

              {convertedAmount !== null && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.result}>
                      {amount} {baseCurrency} = {convertedAmount} {targetCurrency}
                    </Text>
                  </View>
              )}
            </ScrollView>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Set a white background color
    padding: 16,
  },
  scrollContainer: {
    justifyContent: 'center',
    paddingBottom: 20, // Add some padding at the bottom
  },
  input: {
    marginBottom: 8, // Reduced margin to bring the first picker closer
  },
  picker: {
    marginBottom: 8, // Reduced margin to bring the second picker closer
    backgroundColor: '#ffffff', // Ensure the picker has a white background
  },
  button: {
    marginTop: 8, // Reduced margin to move the button up
  },
  resultContainer: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#f4f4f4',
    borderRadius: 5,
    borderWidth: 1, // Add border
    borderColor: '#ccc', // Set border color
  },
  result: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default App;
