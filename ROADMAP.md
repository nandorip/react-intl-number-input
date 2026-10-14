# Roadmap & Sugestões de Novas Features

Este documento reúne sugestões e propostas de melhorias, novos recursos e evoluções arquiteturais para as próximas versões do `react-intl-number-input` (rumo à v1.0.0).

---

## 1. Suporte a Estado Vazio / Limpável (`allowEmpty` / `nullable`)

* **Contexto:** Atualmente, o componente trata ausência de dígitos retornando `0` (ou `minValue`). Isso impede que o campo fique em branco e que atributos como `placeholder` sejam exibidos após o primeiro render. Além disso, dificulta a validação de formulários com campos obrigatórios (`required`).
* **Proposta:**
  * Adicionar prop `allowEmpty?: boolean` (padrão `false` para preservar retrocompatibilidade).
  * Permitir que `value` aceite `null` ou `undefined`.
  * Quando o usuário apagar todo o conteúdo (ou quando `value === null`), o input exibe string vazia `""` e mostra o `placeholder`.
  * No `onChange`, emitir `null` ou `NaN` como valor numérico quando o campo estiver vazio:
    ```tsx
    onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: number | null, maskedValue: string) => void;
    ```

---

## 2. Suporte Nativo a Código de Moeda (`currency`)

* **Contexto:** Hoje, para exibir moeda, o consumidor configura `locale="pt-BR"` e `prefix="R$ "` manualmente.
* **Proposta:**
  * Adicionar a prop `currency?: string` (código ISO 4217, ex: `'BRL'`, `'USD'`, `'EUR'`).
  * Utilizar `Intl.NumberFormat(locale, { style: 'currency', currency })` para derivar automaticamente os prefixos, sufixos e casas decimais padrão da moeda, dispensando a configuração manual de `prefix`/`suffix`/`precision`.
  * Permitir que `prefix` e `suffix` explícitos continuem sobrescrevendo o padrão caso o desenvolvedor prefira customizar o espaçamento.

---

## 3. Modo de Digitação Direta de Separador Decimal (`directDecimalEntry`)

* **Contexto:** O comportamento padrão do componente é no estilo caixa eletrônico (ATM-style, preenchendo da direita para a esquerda). Para valores monetários é ideal, mas alguns casos de uso exigem que o usuário digite a parte inteira e pressione vírgula/ponto para iniciar os decimais.
* **Proposta:**
  * Adicionar uma opção de modo de entrada, ex: `entryMode?: 'atm' | 'direct'` (padrão: `'atm'`).
  * No modo `'direct'`, pressionar a tecla de separador decimal da localidade move o foco para a parte fracionária, comportando-se como uma calculadora convencional.

---

## 4. Integração Aprimorada com Formulários Nativos (`name` & `FormData`)

* **Contexto:** Ao submeter um formulário HTML padrão (`<form>`) ou capturar via `new FormData(form)`, o valor enviado é o valor mascarado com formatação (ex: `"R$ 1.250,50"`), exigindo parsing no backend.
* **Proposta:**
  * Quando a prop `name` for fornecida, renderizar internamente um `<input type="hidden" name={name} value={numericValue} />` (ou usar a API `ElementInternals.setFormValue` quando aplicável).
  * O input visível não precisaria do atributo `name`, garantindo que o backend receba diretamente o número não formatado (`1250.50`).

---

## 5. Suporte Avançado a Colar Valores (`onPaste`)

* **Contexto:** Ao copiar e colar valores de planilhas Excel, extratos bancários ou PDFs (ex: `"R$ 1.500,00"`, `"1,500.00"` ou `"1.500,00 €"`), a remoção ingênua de caracteres não numéricos pode distorcer a escala dependendo dos separadores de milhar e decimal do texto colado.
* **Proposta:**
  * Implementar um handler `onPaste` inteligente que detecte separadores no texto da área de transferência e faça o parse coerente antes de atualizar o estado numérico.

---

## 6. Suporte a Alta Precisão / Grandes Números (`string` / `BigInt` / `BigDecimal`)

* **Contexto:** Valores muito altos (acima de `Number.MAX_SAFE_INTEGER`, ~9 quadrilhões) ou números com muitas casas decimais (como tokens de criptomoedas com 18 casas) sofrem perda de precisão pela limitação do tipo primitivo `number` IEEE 754 de 64 bits do JavaScript.
* **Proposta:**
  * Permitir modo opcional em que `value` e o retorno de `onChange` sejam `string` exata, sem conversão por `Number()`.
  * Toda a aritmética interna de passos e deslocamento de casas já manipula strings em [src/number.ts](src/number.ts), facilitando essa transição.

---

## 7. Limpeza do Repositório (`.gitignore`)

* **Contexto:** Os arquivos compilados em `example/dist/` (`bundle.js`, `index.html`, etc.) estão atualmente rastreados no Git.
* **Proposta:**
  * Adicionar `example/dist/` ao `.gitignore`.
  * Gerar os arquivos do demo apenas durante o deploy (`npm run publish-demo`) ou via GitHub Actions para o branch `gh-pages`, mantendo o histórico e os diffs limpos de binários/bundles minificados.
