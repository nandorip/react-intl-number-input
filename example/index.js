
import React from 'react';
import { render } from 'react-dom';
import IntlNumberInput from '../src';

const App = () => (
  <IntlNumberInput
    locale="pt-BR"
    style="currency"
    currency="BRL"
  />
);
render(<App />, document.getElementById("root"));