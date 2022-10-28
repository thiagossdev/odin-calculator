(function (document, window) {
  class Calculator {
    operations = {
      '+': (x, y) => x + y,
      '-': (x, y) => x - y,
      '*': (x, y) => x * y,
      '/': (x, y) => x / y,
      '^': (x, y) => x ** y,
      '%': (x, y) => x % y,
    };

    currentDisplay = '0';
    history = [];
    accumulator = NaN;
    accumulate = false;
    currentNumber = NaN;
    currentOperation = '';
    lastInput = '';
    clear = false;
    backspaceEnable = false;

    constructor(primary, secondary) {
      this.primary = primary;
      this.secondary = secondary;

      this.reset();
    }

    operate(operator, x, y) {
      if (!Object.keys(this.operations).includes(operator)) {
        throw 'Invalid operation!';
      }

      return this.operations[operator](x, y);
    }

    reset() {
      this.currentDisplay = '0';
      this.history = [];
      this.accumulator = NaN;
      this.accumulate = false;
      this.currentNumber = NaN;
      this.currentOperation = '';
      this.lastInput = '';
      this.clear = false;
      this.backspaceEnable = false;
      this.update();
    }

    parseNumber(number) {
      return parseInt(number);
    }

    isNumber(input) {
      return input.search(/^\d$/) !== -1;
    }

    toString() {
      return `ACC:${this.accumulator} OP[${this.currentOperation}] ${this.currentNumber}:${this.currentDisplay} (${this.lastInput})
  [${this.history}]`;
    }

    processNumber(text) {
      console.log('S:' + this.toString());
      const number = this.parseNumber(text).toString();
      this.processInput(number);

      this.lastInput = number;
      this.backspaceEnable = true;
      this.update();
    }

    isOperator(input, strict) {
      return strict || false ? input.search(/^[\+\-/*=]$/) !== -1 : input.search(/^([\+\-/*=]|Backspace)$/) !== -1;
    }

    processOperator(operator) {
      console.log('S:' + this.toString());
      switch (operator) {
        case 'Clear':
          this.reset();
          break;
        case 'Backspace':
          this.backspace();
          operator = this.lastInput;
          break;
        default:
          this.processOperation(operator);
      }

      if (operator !== '=') {
        this.lastInput = operator;
      }
      this.update();
    }

    processInput(input) {
      if (this.clear) {
        this.clear = false;
        this.currentDisplay = input;
        if (this.history[this.history.length - 1] === '=') {
          this.history = [];
          this.accumulator = NaN;
        }
      } else {
        this.currentDisplay = this.currentDisplay.search(/^0+$/) === -1 ? this.currentDisplay + input : input;
      }

      this.currentNumber = this.parseNumber(this.currentDisplay);
    }

    processOperation(operator) {
      if (this.history[this.history.length - 1] === '=') {
        if (this.currentOperation !== '') {
          console.log('SWAP ACC');
          this.currentDisplay = this.accumulator.toString();
          this.history = [this.currentNumber, this.currentOperation];
        } else {
          this.history = [];
          console.log('ZERO ACC');
          this.currentNumber = this.accumulator;
          this.accumulator = NaN;
        }
      }

      if (operator !== '=') {
        this.accumulate = false;
      }

      if (this.lastInput !== operator) {
        if (!isNaN(this.accumulator) && this.currentOperation !== '' && this.isNumber(this.lastInput)) {
          this.makeOperation(this.currentOperation);
          this.putOperator(operator);
          console.log('A');
        } else if (!isNaN(this.accumulator) && this.currentOperation !== '' && operator === '=') {
          const currentNumber = this.currentNumber;
          const currentOperation = this.currentOperation;
          this.makeOperation(this.currentOperation);
          this.putOperator(operator);
          this.currentNumber = this.accumulator;
          this.accumulator = currentNumber;
          this.currentOperation = currentOperation;
          this.clear = false;
          console.log('D');
        } else if (this.isOperator(this.lastInput, true)) {
          this.putOperator(operator);
          console.log('B');
        } else {
          this.makeOperation(operator);
          console.log('C');
        }
        this.backspaceEnable = false;
      }
    }

    makeOperation(operator) {
      this.pushHistory(this.currentDisplay);
      this.pushHistory(operator);

      if (!isNaN(this.accumulator)) {
        const tempNumber = this.currentNumber;
        this.currentNumber = this.operate(operator, this.accumulator, this.currentNumber);
        this.currentDisplay = this.currentNumber.toString();
        if (!this.accumulate) {
          this.accumulator = operator === '=' ? tempNumber : this.currentNumber;
          this.accumulate = true;
        }
      } else {
        this.currentOperation = operator;
        this.accumulator = this.currentNumber;
      }

      this.clear = true;
    }

    backspace() {
      if (this.backspaceEnable) {
        this.currentDisplay = this.currentDisplay.length > 1 ? this.currentDisplay.slice(0, -1) : '0';
        this.currentNumber = this.parseNumber(this.currentDisplay);
      } else {
        this.history = [];
        this.accumulator = NaN;
      }
      this.update();
    }

    putOperator(operator) {
      console.log('put');
      if (operator !== '=') {
        this.currentOperation = operator;
      }
      this.history[this.history.length - 1] = operator;
    }

    pushHistory(input) {
      if (this.history[this.history.length - 1] === '=') {
        this.history = [];
      }
      this.history.push(input);
    }

    updateDisplay(display, input) {
      // allow 1px inaccuracy by adding 1
      const isScrolledToRight = display.scrollWidth - display.clientWidth <= display.scrollLeft + 1;
      display.innerText = input.trim();

      // scroll to bottom if isScrolledToBottom is true
      if (isScrolledToRight) {
        display.scrollLeft = display.scrollWidth - display.clientWidth;
      }
    }

    updatePrimary() {
      this.updateDisplay(this.primary, this.currentDisplay);
    }

    updateSecondary() {
      this.updateDisplay(this.secondary, this.history.join(''));
    }

    update() {
      console.log('E:' + this.toString());
      this.updatePrimary();
      this.updateSecondary();
    }
  }

  function init() {
    const displayPrimary = document.querySelector('#displayPrimary');
    const displaySecondary = document.querySelector('#displaySecondary');
    const calculator = new Calculator(displayPrimary, displaySecondary);

    document.addEventListener('keydown', (event) => {
      if (typeof event.key !== 'undefined') {
        let handled = false;
        if (calculator.isNumber(event.key)) {
          calculator.processNumber(event.key);
          handled = true;
        } else if (calculator.isOperator(event.key)) {
          calculator.processOperator(event.key);
          handled = true;
        }

        if (handled) {
          event.preventDefault();
        }
      }
      console.log(`${event.key} - ${event.code}`);
    });

    for (const button of document.querySelectorAll('.inputs .button')) {
      button.addEventListener('click', (event) => {
        event.preventDefault();
        if (button.dataset.hasOwnProperty('number')) {
          calculator.processNumber(button.dataset.number);
        } else if (button.dataset.hasOwnProperty('operator')) {
          calculator.processOperator(button.dataset.operator);
        }
      });
    }

    window.calculator = calculator;
  }

  init();
})(document, window);
