class CalcController {

    constructor(){
        
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';

        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();
        this.initButtonsEvents();
        this.initKeyboard();

    }

    //metodo copiar
    copyToClipboard(){
        //crio uma variavel input que recebe o metodo createElement onde ele cria o elemento HTML especificado no input
        //assim podemos criar elementos de tela dinamicamente
        let input = document.createElement('input');

        //agora pegamos o valor que esta dentro da nossa calculadora com o this.displayCalc
        input.value = this.displayCalc;

        //usamos o appendChild para por o elemento input dentro do body
        document.body.appendChild(input);

        //selecionando o valor do input
        input.select();

        //com o execCommand executamos o copiar
        document.execCommand("Copy");

        //removendo input que aparece na tela
        input.remove();

    }

    //metodo colar
    pasteFromClipboard(){
    //usando arrow function para controlar o que queremos ser colado na tela
     document.addEventListener('paste', e=>{

        //pegando o conteudo colado na area de trasnferencia e guardando na variavel text
        //o metodo geData recebe o parametro Text por default onde ele usa para trazer um tipo de informação seja ela numero, texto e imagem
        let text = e.clipboardData.getData('Text');
        
        //com o parseFloat analisamos o valor guardado em text para saber se é uma string ou numero, se for string retorna NaN e se numero retorna o numero colado
        this.displayCalc = parseFloat(text);
        //quano copiado o numero uso o this.addOperation para adcionar o valor de text e conseguir fazer as operações
        this.addOperation(text);

     });   

    }

    initialize(){
        //setando Hora e data 
        this.setDisplayDateTime()
        //atualizando hora a cada 1 segundo, o valor colocado é em milesimos 1000
        setInterval(()=>{

            this.setDisplayDateTime();

        }, 1000);

        //Setando ultimo numero do display que ao iniciar tem valor 0
        this.setLastNumberToDisplay();
        //inicializando o metodo para colar
        this.pasteFromClipboard();

        //selecionando toda a classe .btn-ac com querySelectorAll, lembrando que temos um texto sobre o botão e temos que selecinar os dois para nao ter problema
        //usamos o forEach para percorrer os botoes com arrow function
        document.querySelectorAll('.btn-ac').forEach(btn=>{
            //arrow function para percorrer os botoes com click duplo
            btn.addEventListener('dblclick', a=>{

                this.toggleAudio();

            });

        });

    }
    //metodo criado para interrupção se esta ligado desliga e se esta desligado liga
    toggleAudio(){
        //condicao para saber se esta ele existe entao volto retr=orno o false e se ele nao existe retorno com o true
        if(this._audioOnOff){
            this._audioOnOff = false;
        }else{
            this._audioOnOff = true;
        }

    }

    //metodo para tocar o som
    playAudio(){
        //se o audio estiver desligado eu o ligo com o atributo this._audio.play();
       if (this._audioOnOff){
            //usando o currentTime consigo definir o tempo do audio para executar mais rapido
            this._audio.currentTime = 0;
            this._audio.play();
       } 

    }

    //adcionando os eventos de teclado
    initKeyboard(){

        document.addEventListener('keyup', e=>{
            //switch usado para percorrer as teclas clicadas
            //e é a função e key a propriedade do javascript que captura as teclas
            
            //iniciando o audio com o this.playAudio(); ao usar o teclado
            this.playAudio();

            switch (e.key) {

                case 'Escape':
                    this.clearAll();
                    break;
    
                case 'Backspace':
                    this.clearEntry();
                    break;
                //usamos todos os cases juntos pois usariamo o mesmo atributo em todos
                case '+':
                case '-':
                case '%':
                case '/':
                case '*':
                    this.addOperation(e.key);
                    break;
    
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case '.':
                case ',':
                    this.addDot();
                    break;
                //usamos os cases juntos pois usariamos o atributo com o parseInt em todos os numeros.
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                //case usado para copiar os valores
                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
    
            }

        });


    }

    //adcionando os eventos da pagina em relação ao ponteiro
    addEventListenerAll(element, events, fn){

        events.split(' ').forEach(event => {

            element.addEventListener(event, fn, false);

        })
    
    }

    clearAll(){
        //limpando entradas com o ac
        this._operation = [];
        //usando o this._lastNUmber e o this._lastOperator eu consigo zerar o ultimo operador que ficou na memoria e o ultimo numero exibido no display deixando a calculadora zerada
        this._lastNumber = '';
        this._lastOperator = '';

        this.setLastNumberToDisplay();

    }

    clearEntry(){
        //limpando entradas com o ce 
        this._operation.pop();

        this.setLastNumberToDisplay();

    }

    getLastOperation(){
        //acessando ultima operação feita
        return this._operation[this._operation.length-1];

    }

    setLastOperation(value){
        //setando operador para operação
        this._operation[this._operation.length-1] = value;

    }

    isOperator(value){
        //retornando simbolos para a operação colocando os mesmos no value
        return (['+', '-', '*', '%', '/'].indexOf(value) > -1);

    }

    pushOperation(value){
        //usando push para inserir valor caso eu ja tenha 3 elementos no array fazendo o calculo
        this._operation.push(value);

        if (this._operation.length > 3) {

            this.calc();

        }

    }

    getResult(){
        //usamos um try para fazer uma tentativa de execução onde eu tento colocar um numero seguido da operação e depois o =
        //usando o try{}catch{} eu consigo colocar o resultado como 0
        try{
        //unindo os resultados com o join para fazer o calculo passando o "" como vazio assim comnseguimos fazer operações
        //calculando operações com o eval.
        return eval(this._operation.join(""));
        }catch{
            this.setError();
        }
    }

    calc(){
        //acessando ultimo item da operação para que caso eu pressione o = mais de uma vez o ultimo numer seja repetindo acrescentando a operação 
        let last = '';
        
        this._lastOperator = this.getLastItem();

        if (this._operation.length < 3) {

            let firstItem = this._operation[0];

            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if (this._operation.length > 3) {

            last = this._operation.pop();

            this._lastNumber = this.getResult();

        } else if (this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        }
        
        let result = this.getResult();
        //operação com o porcento onde o result é o valor o=do resultado / 100 , assim temos como resultado a porcentagem.
        if (last == '%') {

            result /= 100;

            this._operation = [result];

        } else {

            this._operation = [result];

            if (last) this._operation.push();

        }
        //enviando o numero para o display
        this.setLastNumberToDisplay();

    }

    getLastItem(isOperator = true){

        let lastItem;

        for (let i = this._operation.length-1; i >= 0; i--){

            if (this.isOperator(this._operation[i]) == isOperator) {
    
                lastItem = this._operation[i];
    
                break;
    
            }

        }

        if (!lastItem && lastItem != 0) {


            //if ternario para continuar a ultima operação pressionando o igual mais de uma vez ou a outra operação
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;

    }

    setLastNumberToDisplay(){
        //setando numero no display se NAO lastNumber , lastNumber recebe valor 0 
        let lastNumber = this.getLastItem(false);

        if (!lastNumber) lastNumber = 0;
        //quando o display for igual a 0 o displayCalc pega o valor da operação e adciona a lastNumber
        this.displayCalc = lastNumber;

    }

    addOperation(value){

        //a funçaõ isNaN verifica se o valor nao é um numero
        if (isNaN(this.getLastOperation())) {
            //se o operador nao recebe numero ele seta o valor do operador
            if (this.isOperator(value)) {

                this.setLastOperation(value);

            } else {
                //se não, usa o push para inserir o ultimo numero  na operação e colocala no display
                this.pushOperation(value);

                this.setLastNumberToDisplay();

            }
            
        } else {
            //setando operador no value para fazer a operação
            if (this.isOperator(value)){

                this.pushOperation(value);

            } else {
                let newValue = this.getLastOperation().toString() + value.toString();

                this.setLastOperation(newValue);

                this.setLastNumberToDisplay();

            }

        }

    }

    setError(){
        //Caso de algum erro retorna error na calculadora
        this.displayCalc = "Error";
        
    }

    //adcionando operação para uso do ponto
    addDot(){

       let lastOperation = this.getLastOperation();
        //com este if procuro dentro da minha ultima operação se possui um . e se o valor for 1 quer dizer que sim
        // o valor 1 vem da resposta do indexof, usamos o indexof para percorrer o array e procurar se nele tem o caractere desejado
        //usamos o typeof para ver se o lastOperation me retorna uma string ou seja o ponto.
        if(typeof lastOperation === 'string' && lastOperation.split('').indexof('.') > -1) return;

        //se lastOperation é um operador ou ele nao existir
       if(this.isOperator(lastOperation) || !lastOperation){
            //adciono o itme com o push
           this.pushOperation('0.');
        //se ele nao for um operador e for um numero
       }else {
           //pego a variavel e transformo em string concatenando com o ponto caso seja um numero
           this.setLastOperation(lastOperation.toString() + '.');
       }

       this.setLastNumberToDisplay();

    }

    //usando o switch para definir as operações dos botoes
    execBtn(value){

        //usado para iniciar o audio ao executar botão
        this.playAudio();

        switch (value) {

            case 'ac':
                this.clearAll();
                break;

            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot();
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;

        }

    }
    //inicializando os botoes, lembrando que os botoes tem uma caixa de texto por cima entao ao clicar em ambos deve retornar o mesmo valor
    initButtonsEvents(){
        //selecionando os botoes e os textos com ambos os ids do html 
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn, index)=>{
            //colocando o mesmo valor apos clicar ou arrastar no botao desejado
            this.addEventListenerAll(btn, "click drag", e => {

                let textBtn = btn.className.baseVal.replace("btn-","");

                this.execBtn(textBtn);

            })
            //adcionando evento nos botoes para o usuario compreender onde quer clicar transformando a seta em uma pequena mão ao passar encima do botao
            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e => {

                btn.style.cursor = "pointer";

            })

        })

    }
    //stando a hora local e data de acordo com o atributo ptbr no construct 
    setDisplayDateTime(){

        this.displayDate = this.currentDate.toLocaleDateString(this._locale);
        this.displayTime = this.currentDate.toLocaleTimeString(this._locale);

    }

    get displayTime(){

        return this._timeEl.innerHTML;

    }

    set displayTime(value){

        return this._timeEl.innerHTML = value;

    }

    get displayDate(){

        return this._dateEl.innerHTML;

    }

    set displayDate(value){

        return this._dateEl.innerHTML = value;

    }

    get displayCalc(){

        return this._displayCalcEl.innerHTML;

    }

    set displayCalc(value){
        //com esse if podemos definir que ao chegar a mais de 10 numeros na nossa calculadora ele dara um erro.
        //transformamos o valor em string pois no display ele é retornado como numero e o length é usao para strings , entao ao retornar como numero temos o resultado completo.
        if(value.toString().length > 10){
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;

    }

    get currentDate(){

        return new Date();

    }

    set currentDate(value){

        this._currentDate = value;

    }

}