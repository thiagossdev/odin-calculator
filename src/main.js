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

    processNumber(text) {
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
      if (this.history[this.history.length - 1] === '=') {
        this.history = [];
        if (this.currentOperation !== '') {
          const temp = this.currentNumber;
          this.currentNumber = this.accumulator;
          this.accumulator = temp;
          this.lastInput = this.currentOperation;
        } else {
          this.currentNumber = this.accumulator;
          this.accumulator = NaN;
          this.lastInput = '1';
        }
      }

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

      this.lastInput = operator;
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
      console.log(this.currentOperation, this.accumulator, this.lastInput, operator);
      if (this.lastInput !== operator) {
        if (!isNaN(this.accumulator) && this.currentOperation !== '' && this.isNumber(this.lastInput)) {
          this.makeOperation(this.currentOperation);
          this.putOperator(operator);
          if (operator === '=') {
            this.currentOperation = '';
          }
        } else if (!isNaN(this.accumulator) && this.currentOperation !== '' && operator === '=') {
          const currentNumber = this.currentNumber;
          const currentOperation = this.currentOperation;
          this.makeOperation(this.currentOperation);
          this.putOperator(operator);
          this.currentNumber = this.accumulator;
          this.accumulator = currentNumber;
          this.currentOperation = currentOperation;
          this.clear = false;
          console.log(this.currentOperation, this.accumulator, this.lastInput, operator);
          console.log('D');
        } else if (this.isOperator(this.lastInput, true)) {
          this.putOperator(operator);
          console.log('B');
        } else {
          this.makeOperation(operator);
          console.log('C' + operator);
        }
        this.backspaceEnable = false;
      }
    }

    makeOperation(operator) {
      this.pushHistory(this.currentDisplay);
      this.pushHistory(operator);

      if (!isNaN(this.accumulator)) {
        this.accumulator = this.operate(operator, this.accumulator, this.currentNumber);
        this.currentOperation = '';
        this.currentDisplay = this.accumulator.toString();
      } else {
        this.currentOperation = operator;
        this.accumulator = this.currentNumber;
      }
      console.log('ACC: ' + this.accumulator);

      this.clear = true;
    }

    backspace() {
      if (this.backspaceEnable) {
        this.currentDisplay = this.currentDisplay.length > 1 ? this.currentDisplay.slice(0, -1) : '0';
        this.currentNumber = this.parseNumber(this.currentDisplay);
        this.update();
      }
    }

    putOperator(operator) {
      console.log('put');
      this.currentOperation = operator;
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
