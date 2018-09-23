
import React from 'react';
import { render } from 'react-dom';
import IntlNumberInput from '../src';

const App = () => (
  <IntlNumberInput
    locale="pt-BR"
    prefix="R$"
    precision={2}
  />
);
render(<App />, document.getElementById("root"));